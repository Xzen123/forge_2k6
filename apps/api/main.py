"""
Civic Pulse — FastAPI application (M7).

Endpoints:
  POST /chat          — SSE streaming chat (text or audio)
  POST /voice         — Upload audio → transcript → chat
  GET  /sources       — Live source status
  GET  /changes       — Recent document_changed events
  GET  /health        — DB, LLM, ingestion status
  GET  /session/{id}  — Session profile + history
  POST /admin/ingest/{source} — Manual ingestion trigger (admin token)
"""

from __future__ import annotations

import packages  # noqa: F401 (initializes pure-python shims if needed)
import asyncio
import json
import os
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, AsyncIterator, Optional

import anthropic
import structlog
from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    File,
    Header,
    HTTPException,
    Request,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from packages.agent.graph import AgentGraph, build_graph
from packages.agent.guardrails.guardrails import (
    InputGuardrailError,
    add_disclaimer,
    check_input,
    get_error_message,
    redact_pii,
)
from packages.config import settings
from packages.ingest.pipeline import IngestPipeline, _ADAPTERS
from packages.knowledge.db import (
    AuditLogModel,
    DocumentModel,
    IngestionRunModel,
    SessionModel,
    get_db,
)
from packages.knowledge.schemas import AgentState, UserProfile
from packages.lang.voice import SarvamSTT, SarvamTranslator, SarvamTTS, detect_language, clean_text_for_speech

log = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: configure structured logging. Shutdown: cleanup."""
    import structlog
    structlog.configure(
        processors=[
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ]
    )
    log.info("civic_pulse_starting", version="1.0.0")
    yield
    log.info("civic_pulse_stopping")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Civic Pulse API",
    description="Agentic scheme & policy assistant for Indian citizens.",
    version="1.0.0",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.api_frontend_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error("unhandled_exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"error": "An unexpected error occurred. Please try again."},
    )


# ---------------------------------------------------------------------------
# Request/Response models
# ---------------------------------------------------------------------------


class ChatRequest(BaseModel):
    session_id: str
    text: Optional[str] = None
    language: Optional[str] = None
    reset_profile: Optional[bool] = False


class SourceInfo(BaseModel):
    name: str
    last_success_at: Optional[datetime]
    document_count: int
    stale: bool


class ChangeEvent(BaseModel):
    source: str
    document_id: Optional[str]
    diff_summary: str
    occurred_at: datetime


# ---------------------------------------------------------------------------
# Helper: get or create session (with in-memory fallback if DB is unreachable)
# ---------------------------------------------------------------------------


class MemorySession:
    """In-memory fallback session when PostgreSQL is offline or unreachable."""

    def __init__(self, session_id: str):
        self.id = session_id
        self.profile_json: dict = {}
        self.history_json: list = []
        self.language: str = "en"
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)


_IN_MEMORY_SESSIONS: dict[str, MemorySession] = {}


async def _get_or_create_session(session_id: str, db: AsyncSession) -> Any:
    try:
        result = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
        session = result.scalar_one_or_none()
        if session is None:
            session = SessionModel(
                id=session_id,
                profile_json={},
                history_json=[],
                language="en",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(session)
            await db.flush()
        return session
    except Exception as exc:
        log.warning("db_session_unavailable_using_memory_fallback", session_id=session_id, error=str(exc))
        if session_id not in _IN_MEMORY_SESSIONS:
            _IN_MEMORY_SESSIONS[session_id] = MemorySession(session_id)
        return _IN_MEMORY_SESSIONS[session_id]


# ---------------------------------------------------------------------------
# POST /chat — SSE streaming
# ---------------------------------------------------------------------------


@app.post("/chat")
@limiter.limit(f"{settings.api_rate_limit_per_minute}/minute")
async def chat(request: Request, body: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Stream agent reasoning trace and final answer via SSE."""

    text_input = body.text or ""

    # Input guardrails
    lang = body.language or "en"
    try:
        text_input = check_input(text_input)
    except InputGuardrailError as exc:
        error_key = str(exc)
        msg = get_error_message(error_key, lang)

        async def error_stream():
            yield {"event": "error", "data": json.dumps({"message": msg, "code": error_key})}

        return EventSourceResponse(error_stream())

    # Load session
    session = await _get_or_create_session(body.session_id, db)
    profile_data = {} if body.reset_profile else (session.profile_json or {})
    profile = UserProfile(**profile_data)
    profile.language = lang

    # Build initial agent state
    state = AgentState(
        session_id=body.session_id,
        raw_input=redact_pii(text_input),  # redact before storing in trace
        detected_language=lang,
        profile=profile,
    )

    graph = build_graph(db)

    async def event_stream() -> AsyncIterator[dict]:
        final_state = state
        try:
            async for event in graph.astream(state, stream_mode="updates", config={"recursion_limit": 25}):
                for node_name, raw_node_state in event.items():
                    node_state = (
                        AgentState(**raw_node_state)
                        if isinstance(raw_node_state, dict)
                        else raw_node_state
                    )
                    if isinstance(node_state, AgentState):
                        final_state = node_state

                        # Emit profile_update as soon as intake finishes
                        if node_name == "intake" or (node_state.trace and node_state.trace[-1].step == "intake"):
                            yield {
                                "event": "profile_update",
                                "data": json.dumps(node_state.profile.model_dump(mode="json")),
                            }

                        # Emit the latest trace event
                        if node_state.trace:
                            last = node_state.trace[-1]
                            yield {
                                "event": "trace_event",
                                "data": json.dumps({
                                    "step": last.step,
                                    "tool": last.tool,
                                    "summary": last.output_summary,
                                    "latency_ms": last.latency_ms,
                                    "ok": last.ok,
                                }),
                            }

                        # Emit followup question if state ends with one
                        if node_state.trace and node_state.trace[-1].step == "ask_followup":
                            yield {
                                "event": "followup_question",
                                "data": json.dumps({"question": node_state.final_answer}),
                            }

            # Persist updated session
            session.profile_json = final_state.profile.model_dump()
            history = session.history_json or []
            history.append({
                "role": "user",
                "content": redact_pii(text_input),
                "ts": _now_iso(),
            })
            history.append({
                "role": "assistant",
                "content": final_state.final_answer[:500],
                "ts": _now_iso(),
            })
            session.history_json = history[-40:]  # keep last 20 turns
            session.updated_at = datetime.now(timezone.utc)
            try:
                await db.commit()
            except Exception as exc:
                log.warning("session_commit_fallback", error=str(exc))

            if final_state.trace and final_state.trace[-1].step == "ask_followup":
                # Followup question already dispatched via "followup_question" event; stream concludes for citizen reply
                return

            final_answer = add_disclaimer(final_state.final_answer)

            yield {
                "event": "final_answer",
                "data": json.dumps({
                    "text": final_answer,
                    "claims": [c.model_dump(mode="json") for c in final_state.claims],
                    "language": final_state.detected_language,
                    "errors": final_state.errors,
                }, default=str),
            }
        except Exception as exc:
            log.error("stream_error", error=str(exc))
            yield {
                "event": "error",
                "data": json.dumps({"message": "An error occurred. Please try again.", "code": "internal"}),
            }

    return EventSourceResponse(event_stream())


# ---------------------------------------------------------------------------
# POST /voice — audio upload
# ---------------------------------------------------------------------------


@app.post("/voice")
@limiter.limit(f"{settings.api_rate_limit_per_minute}/minute")
async def voice(request: Request, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """Upload audio, get transcript, then route to /chat SSE stream."""
    audio_bytes = await file.read()
    mime = file.content_type or "audio/webm"

    stt = SarvamSTT()
    try:
        result = await stt.transcribe(audio_bytes, mime_type=mime)
    finally:
        await stt.close()

    if not result.get("text") or result.get("confidence", 1.0) < 0.3:
        lang = result.get("language", "en")
        return JSONResponse(
            status_code=422,
            content={"error": get_error_message("stt_failure", lang), "transcript": ""},
        )

    return JSONResponse({
        "transcript": result["text"],
        "language": result["language"],
        "confidence": result["confidence"],
    })


# ---------------------------------------------------------------------------
# POST /tts — Sarvam AI Text-to-Speech
# ---------------------------------------------------------------------------


class TTSRequest(BaseModel):
    text: str
    language: Optional[str] = "hi"
    clean_for_speech: Optional[bool] = True


class TTSResponse(BaseModel):
    audio_base64: str
    mime_type: str = "audio/wav"
    cached: bool
    language: str
    spoken_text: str


_TTS_ENDPOINT_CACHE: dict[str, TTSResponse] = {}
_SHARED_TTS_ENGINE: Optional[SarvamTTS] = None
_SHARED_TRANSLATOR: Optional[SarvamTranslator] = None


def get_shared_tts() -> SarvamTTS:
    global _SHARED_TTS_ENGINE
    if _SHARED_TTS_ENGINE is None:
        _SHARED_TTS_ENGINE = SarvamTTS()
    return _SHARED_TTS_ENGINE


def get_shared_translator() -> SarvamTranslator:
    global _SHARED_TRANSLATOR
    if _SHARED_TRANSLATOR is None:
        _SHARED_TRANSLATOR = SarvamTranslator()
    return _SHARED_TRANSLATOR


@app.post("/tts", response_model=TTSResponse)
@limiter.limit(f"{settings.api_rate_limit_per_minute}/minute")
async def tts(request: Request, body: TTSRequest):
    """Synthesize text into authentic Indian regional speech using Sarvam AI Bulbul."""
    target_lang = (body.language or "hi").lower()
    raw_text = body.text or ""
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    spoken_text = clean_text_for_speech(raw_text) if body.clean_for_speech else raw_text.strip()
    cache_key = f"{target_lang}:{spoken_text}"

    # Return immediately from memory cache if available (< 2ms)
    if cache_key in _TTS_ENDPOINT_CACHE:
        cached_resp = _TTS_ENDPOINT_CACHE[cache_key]
        return TTSResponse(
            audio_base64=cached_resp.audio_base64,
            mime_type=cached_resp.mime_type,
            cached=True,
            language=target_lang,
            spoken_text=cached_resp.spoken_text,
        )

    # If the text is in English and target is regional (hi, bn, ta, te, etc.), translate for natural regional pronunciation
    import re
    has_indic = bool(re.search(r"[\u0900-\u0D7F]", spoken_text))
    if not has_indic and target_lang not in ("en", "en-in"):
        translator = get_shared_translator()
        try:
            translated = await translator.translate(spoken_text, source_lang="en", target_lang=target_lang)
            if translated and len(translated.strip()) > 5:
                spoken_text = translated
        except Exception as exc:
            log.warning("tts_translation_skipped", error=str(exc))

    tts_engine = get_shared_tts()
    audio_bytes = await tts_engine.synthesize(spoken_text, language=target_lang, clean=False)

    if not audio_bytes:
        raise HTTPException(status_code=502, detail="Speech synthesis failed")

    import base64
    audio_b64 = base64.b64encode(audio_bytes).decode("ascii")

    response_obj = TTSResponse(
        audio_base64=audio_b64,
        mime_type="audio/wav",
        cached=False,
        language=target_lang,
        spoken_text=spoken_text,
    )
    _TTS_ENDPOINT_CACHE[cache_key] = response_obj
    return response_obj


class TranslateRequest(BaseModel):
    text: str
    target_language: str = "hi"
    source_language: str = "en"


class TranslateResponse(BaseModel):
    translated_text: str
    target_language: str
    cached: bool


@app.post("/translate", response_model=TranslateResponse)
@limiter.limit(f"{settings.api_rate_limit_per_minute}/minute")
async def translate_text(request: Request, body: TranslateRequest):
    """Translate civic advice and statutory rights into Indian regional languages using Sarvam Mayura."""
    src = (body.source_language or "en").lower()
    tgt = (body.target_language or "hi").lower()
    raw = (body.text or "").strip()
    if not raw:
        return TranslateResponse(translated_text="", target_language=tgt, cached=True)

    if src == tgt:
        return TranslateResponse(translated_text=raw, target_language=tgt, cached=True)

    translator = get_shared_translator()
    translated = await translator.translate(raw, source_lang=src, target_lang=tgt)
    return TranslateResponse(translated_text=translated, target_language=tgt, cached=False)


# ---------------------------------------------------------------------------
# GET /sources
# ---------------------------------------------------------------------------


@app.get("/sources", response_model=list[SourceInfo])
async def get_sources(db: AsyncSession = Depends(get_db)):
    """Return per-source status: last success, doc count, stale flag."""
    sources = []
    try:
        for name in _ADAPTERS:
            # Last successful run
            run_result = await db.execute(
                select(IngestionRunModel)
                .where(IngestionRunModel.source == name, IngestionRunModel.success.is_(True))
                .order_by(desc(IngestionRunModel.ended_at))
                .limit(1)
            )
            last_run = run_result.scalar_one_or_none()
            last_success_at = last_run.ended_at if last_run else None

            # Doc count
            count_result = await db.execute(
                select(func.count(DocumentModel.id)).where(
                    DocumentModel.source == name, DocumentModel.is_latest.is_(True)
                )
            )
            doc_count = count_result.scalar() or 0

            # Stale: no success in last 2 * interval
            stale = True
            if last_success_at:
                elapsed = (datetime.now(timezone.utc) - last_success_at).total_seconds()
                stale = elapsed > settings.ingest_interval_minutes * 60 * 2

            sources.append(SourceInfo(
                name=name,
                last_success_at=last_success_at,
                document_count=doc_count,
                stale=stale,
            ))
    except Exception as exc:
        log.warning("sources_db_unavailable_degraded", error=str(exc))
        # Graceful degradation per M5 failure matrix
        return [
            SourceInfo(name=name, last_success_at=None, document_count=0, stale=True)
            for name in _ADAPTERS
        ]
    return sources


# ---------------------------------------------------------------------------
# GET /changes
# ---------------------------------------------------------------------------


@app.get("/changes", response_model=list[ChangeEvent])
async def get_changes(db: AsyncSession = Depends(get_db), limit: int = 20):
    """Return recent document_changed audit events."""
    try:
        result = await db.execute(
            select(AuditLogModel)
            .where(AuditLogModel.event_type == "document_changed")
            .order_by(desc(AuditLogModel.created_at))
            .limit(min(limit, 100))
        )
        events = []
        for row in result.scalars().all():
            events.append(ChangeEvent(
                source=row.source,
                document_id=str(row.document_id) if row.document_id else None,
                diff_summary=row.payload.get("diff_summary", ""),
                occurred_at=row.created_at,
            ))
        return events
    except Exception as exc:
        log.warning("changes_db_unavailable_degraded", error=str(exc))
        return []


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------


@app.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    """Return DB connectivity, LLM reachability, and last ingestion timestamp."""
    # DB check
    db_ok = False
    try:
        await db.execute(select(1))
        db_ok = True
    except Exception as exc:
        log.warning("health_db_unavailable", error=str(exc))

    # LLM check
    llm_ok = False
    try:
        client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        await client.messages.create(
            model=settings.anthropic_model,
            max_tokens=5,
            messages=[{"role": "user", "content": "ping"}],
        )
        llm_ok = True
    except Exception as exc:
        log.warning("health_llm_unavailable", error=str(exc))

    # Last ingestion
    last_ingest: Optional[datetime] = None
    if db_ok:
        try:
            result = await db.execute(
                select(IngestionRunModel)
                .where(IngestionRunModel.success.is_(True))
                .order_by(desc(IngestionRunModel.ended_at))
                .limit(1)
            )
            run = result.scalar_one_or_none()
            last_ingest = run.ended_at if run else None
        except Exception:
            pass

    return {
        "status": "ok" if (db_ok and llm_ok) else "degraded",
        "db": db_ok,
        "llm": llm_ok,
        "last_successful_ingestion": last_ingest,
        "version": "1.0.0",
    }


# ---------------------------------------------------------------------------
# GET /session/{id}
# ---------------------------------------------------------------------------


@app.get("/session/{session_id}")
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    session = None
    try:
        result = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
        session = result.scalar_one_or_none()
    except Exception as exc:
        log.warning("get_session_db_unavailable", error=str(exc))
        session = _IN_MEMORY_SESSIONS.get(session_id)

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id": session.id,
        "profile": getattr(session, "profile_json", {}),
        "history": getattr(session, "history_json", []),
        "language": getattr(session, "language", "en"),
        "created_at": session.created_at,
        "updated_at": session.updated_at,
    }


# ---------------------------------------------------------------------------
# POST /admin/ingest/{source}
# ---------------------------------------------------------------------------


@app.post("/admin/ingest/{source}")
async def admin_ingest(
    source: str,
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """Trigger manual ingestion for a source. Requires admin token."""
    if authorization != f"Bearer {settings.api_admin_token}":
        raise HTTPException(status_code=403, detail="Invalid admin token")

    if source not in _ADAPTERS and source != "all":
        raise HTTPException(
            status_code=404,
            detail=f"Unknown source: {source!r}. Available: {list(_ADAPTERS)} or 'all'",
        )

    async def _run():
        pipeline = IngestPipeline(db)
        if source == "all":
            await pipeline.run_all()
        else:
            await pipeline.run_source(source)

    background_tasks.add_task(_run)
    return {"status": "ingestion_started", "source": source}


# ---------------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------------


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
