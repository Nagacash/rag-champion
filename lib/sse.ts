import { sseEventSchema, type SseEvent } from "./rag-types";

export type SseCallbacks = {
  onEvent?: (event: SseEvent) => void;
  onToken?: (event: Extract<SseEvent, { type: "token" }>) => void;
  onFinal?: (event: Extract<SseEvent, { type: "final" }>) => void;
  onSources?: (event: Extract<SseEvent, { type: "sources" }>) => void;
  onError?: (event: Extract<SseEvent, { type: "error" }>) => void;
};

/**
 * Consume an SSE stream from a Fetch Response, parsing JSON `data:` lines
 * into typed SseEvent objects validated by Zod.
 */
export async function streamSseResponse(
  response: Response,
  callbacks: SseCallbacks,
  abortSignal?: AbortSignal,
): Promise<void> {
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("SSE response has no readable body");
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  const pump = async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (abortSignal?.aborted) {
        try {
          reader.cancel();
        } catch {
          // ignore
        }
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let separatorIndex = buffer.indexOf("\n\n");
      while (separatorIndex !== -1) {
        const rawEvent = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + 2);
        handleRawEvent(rawEvent, callbacks);
        separatorIndex = buffer.indexOf("\n\n");
      }
    }
  };

  await pump();
}

function handleRawEvent(raw: string, callbacks: SseCallbacks) {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return;

  const dataLines = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trim());

  if (!dataLines.length) return;

  const jsonPayload = dataLines.join("\n");

  try {
    const parsed = JSON.parse(jsonPayload);
    const result = sseEventSchema.safeParse(parsed);
    if (!result.success) {
      // eslint-disable-next-line no-console
      console.warn("Invalid SSE event payload", result.error);
      return;
    }

    const event = result.data;
    callbacks.onEvent?.(event);

    switch (event.type) {
      case "token":
        callbacks.onToken?.(event);
        break;
      case "final":
        callbacks.onFinal?.(event);
        break;
      case "sources":
        callbacks.onSources?.(event);
        break;
      case "error":
        callbacks.onError?.(event);
        break;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse SSE event JSON", err);
  }
}

