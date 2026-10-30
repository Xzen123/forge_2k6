// API client for Civic Pulse backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  | { type: "final_answer"; data: FinalAnswerData }
  | { type: "error"; data: { message: string; code: string } };

export async function* streamChat(
  sessionId: string,
  text: string,
  language: string
): AsyncGenerator<SSEEvent> {
  const resp = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, text, language }),
  });

  if (!resp.ok || !resp.body) {
    yield {
      type: "error",
      data: { message: "Failed to connect to server.", code: "network_error" },
    };
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    let eventType = "";
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        const raw = line.slice(6).trim();
        try {
          const parsed = JSON.parse(raw);
          yield { type: eventType as SSEEvent["type"], data: parsed } as SSEEvent;
        } catch {}
        eventType = "";
      }
    }
  }
}

export async function transcribeAudio(blob: Blob): Promise<{
  transcript: string;
  language: string;
}> {
  const formData = new FormData();
  formData.append("file", blob, "audio.webm");
  const resp = await fetch(`${API_BASE}/voice`, { method: "POST", body: formData });
  if (!resp.ok) throw new Error("STT failed");
  return resp.json();
}

export async function getSources(): Promise<SourceInfo[]> {
  const resp = await fetch(`${API_BASE}/sources`);
  if (!resp.ok) return [];
  return resp.json();
}

export async function getChanges(): Promise<ChangeEvent[]> {
  const resp = await fetch(`${API_BASE}/changes?limit=10`);
  if (!resp.ok) return [];
  return resp.json();
}

export async function getHealth(): Promise<Record<string, unknown>> {
  const resp = await fetch(`${API_BASE}/health`);
  if (!resp.ok) return {};
  return resp.json();
}
