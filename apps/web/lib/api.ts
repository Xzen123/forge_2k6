// API client for Civic Pulse backend
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "/api/backend"
    : "http://localhost:8001");

export type TraceEventData = {
  step: string;
  tool: string | null;
  summary: string;
  latency_ms: number;
  ok: boolean;
};

export type CitationData = {
  url: string;
  quote: string;
  fetched_at: string;
};

export type ClaimData = {
  text: string;
  citations: CitationData[];
  verified: boolean;
};

export type FinalAnswerData = {
  text: string;
  claims: ClaimData[];
  language: string;
  audio_url?: string;
  errors: string[];
};

export type SourceInfo = {
  name: string;
  last_success_at: string | null;
  document_count: number;
  stale: boolean;
};

export type ChangeEvent = {
  source: string;
  document_id: string | null;
  diff_summary: string;
  occurred_at: string;
};

export type SSEEvent =
  | { type: "trace_event"; data: TraceEventData }
  | { type: "followup_question"; data: { question: string } }
  | { type: "profile_update"; data: Record<string, any> }
  | { type: "final_answer"; data: FinalAnswerData }
  | { type: "error"; data: { message: string; code: string } };

export async function* streamChat(
  sessionId: string,
  text: string,
  language: string,
  options?: { resetProfile?: boolean; signal?: AbortSignal }
): AsyncGenerator<SSEEvent> {
  let resp: Response;
  try {
    resp = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        text,
        language,
        reset_profile: options?.resetProfile ?? false,
      }),
      signal: options?.signal,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return;
    }
    yield {
      type: "error",
      data: {
        message: "Cannot connect to the Civic Pulse backend at " + API_BASE + ". Please ensure the backend is running.",
        code: "network_error",
      },
    };
    return;
  }

  if (!resp.ok || !resp.body) {
    yield {
      type: "error",
      data: { message: "Server returned error: " + resp.status, code: "server_error" },
    };
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      let eventType = "";
      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventType = line.slice(line.indexOf(":") + 1).trim();
        } else if (line.startsWith("data:")) {
          const raw = line.slice(line.indexOf(":") + 1).trim();
          try {
            const parsed = JSON.parse(raw);
            yield { type: eventType as SSEEvent["type"], data: parsed } as SSEEvent;
          } catch {}
          eventType = "";
        }
      }
    }
  } catch {
    yield {
      type: "error",
      data: { message: "Connection interrupted.", code: "stream_error" },
    };
  }
}

export async function transcribeAudio(blob: Blob): Promise<{
  transcript: string;
  language: string;
}> {
  try {
    const formData = new FormData();
    formData.append("file", blob, "audio.webm");
    const resp = await fetch(`${API_BASE}/voice`, { method: "POST", body: formData });
    if (!resp.ok) throw new Error("STT failed");
    return await resp.json();
  } catch {
    throw new Error("Unable to connect to audio transcription service.");
  }
}

export async function getSources(): Promise<SourceInfo[]> {
  try {
    const resp = await fetch(`${API_BASE}/sources`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch {
    return [];
  }
}

export async function getChanges(): Promise<ChangeEvent[]> {
  try {
    const resp = await fetch(`${API_BASE}/changes?limit=10`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch {
    return [];
  }
}

export async function getHealth(): Promise<Record<string, unknown>> {
  try {
    const resp = await fetch(`${API_BASE}/health`);
    if (!resp.ok) return {};
    return await resp.json();
  } catch {
    return {};
  }
}

export interface TTSResult {
  audio_base64: string;
  mime_type: string;
  cached: boolean;
  language: string;
  spoken_text: string;
}

export async function synthesizeSpeech(
  text: string,
  language: string = "hi"
): Promise<TTSResult> {
  const resp = await fetch(`${API_BASE}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language, clean_for_speech: true }),
  });
  if (!resp.ok) {
    throw new Error(`TTS service error: ${resp.status}`);
  }
  return await resp.json();
}

export interface TranslateResult {
  translated_text: string;
  target_language: string;
  cached: boolean;
}

export async function translateText(
  text: string,
  targetLanguage: string = "hi",
  sourceLanguage: string = "en"
): Promise<TranslateResult> {
  try {
    const resp = await fetch(`${API_BASE}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        target_language: targetLanguage,
        source_language: sourceLanguage,
      }),
    });
    if (!resp.ok) {
      return { translated_text: text, target_language: targetLanguage, cached: false };
    }
    return await resp.json();
  } catch {
    return { translated_text: text, target_language: targetLanguage, cached: false };
  }
}
