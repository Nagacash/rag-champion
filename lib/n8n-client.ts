import {
  chatRequestSchema,
  metricsResponseSchema,
  retrievalResponseSchema,
  uploadResultSchema,
  type ChatRequest,
  type MetricsResponse,
  type RetrievalResponse,
  type UploadResult,
} from "./rag-types";
import type { SseCallbacks } from "./sse";
import { streamSseResponse } from "./sse";

const N8N_BASE_URL =
  process.env.N8N_BASE_URL ?? "https://n8n.srv1157232.hstgr.cloud";

const N8N_CHAT_WEBHOOK_PATH =
  process.env.N8N_CHAT_WEBHOOK_PATH ??
  "/webhook/4091fa09-fb9a-4039-9411-7104d213f601/chat";

const N8N_UPLOAD_WEBHOOK_PATH =
  process.env.N8N_UPLOAD_WEBHOOK_PATH ?? "/webhook/first-family-upload";

const N8N_METRICS_WEBHOOK_PATH =
  process.env.N8N_METRICS_WEBHOOK_PATH ?? "/webhook/first-family-metrics";

const N8N_RETRIEVAL_WEBHOOK_PATH =
  process.env.N8N_RETRIEVAL_WEBHOOK_PATH ?? "/webhook/first-family-retrieval";

const N8N_WORKFLOW_TEST_WEBHOOK_PATH =
  process.env.N8N_WORKFLOW_TEST_WEBHOOK_PATH ??
  "/webhook/first-family-workflow-test";

/** Optional. Path to n8n webhook that deletes one doc by fileName (e.g. /webhook/xxx/erase-doc). */
const N8N_ERASE_DOC_WEBHOOK_PATH =
  process.env.N8N_ERASE_DOC_WEBHOOK_PATH ?? "";

/** Optional. Path to n8n webhook that erases all indexed docs (e.g. /webhook/xxx/erase-docs). */
const N8N_ERASE_DOCS_WEBHOOK_PATH =
  process.env.N8N_ERASE_DOCS_WEBHOOK_PATH ?? "";

const N8N_API_KEY = process.env.N8N_API_KEY;

const SERVER_BASE = N8N_BASE_URL.replace(/\/$/, "");

function buildServerUrl(path: string) {
  return `${SERVER_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Build URL for erase-doc: accepts full URL or path (path is appended to N8N_BASE_URL). */
function buildEraseDocUrl(): string {
  const raw = N8N_ERASE_DOC_WEBHOOK_PATH.trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return buildServerUrl(raw);
}

function authHeaders(): Record<string, string> {
  return N8N_API_KEY ? { Authorization: `Bearer ${N8N_API_KEY}` } : {};
}

export const n8nServer = {
  /**
   * Server-side helper to call the upstream n8n chat webhook directly.
   * Typically used from the /api/proxy route rather than from components.
   */
  async queryRagServer(body: ChatRequest, signal?: AbortSignal) {
    const parsed = chatRequestSchema.parse(body);

    // n8n expects exactly: { "chatInput": "<user message>" }
    // e.g. { "chatInput": "how many files do we have list all" }, { "chatInput": "ai playbook summary" }
    const n8nBody = { chatInput: parsed.query };

    const response = await fetch(
      buildServerUrl(N8N_CHAT_WEBHOOK_PATH),
      {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          ...authHeaders(),
        }),
        body: JSON.stringify(n8nBody),
        signal,
      },
    );

    return response;
  },

  async uploadFilesServer(formData: FormData, signal?: AbortSignal) {
    const response = await fetch(
      buildServerUrl(N8N_UPLOAD_WEBHOOK_PATH),
      {
        method: "POST",
        headers: {
          ...authHeaders(),
        },
        body: formData,
        signal,
      },
    );

    const responseText = await response.text();
    console.log("[DEBUG] n8n upload response:", response.status, responseText.substring(0, 500));
    
    let json: unknown;
    try {
      json = JSON.parse(responseText);
    } catch {
      json = null;
    }
    
    if (json) {
      const parsed = uploadResultSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      console.log("[DEBUG] Schema validation failed:", parsed.error);
    }

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}: ${responseText}`);
    }

    const totalFiles = formData.getAll("files").length;
    return {
      totalFiles,
      processedFiles: totalFiles,
      failedFiles: 0,
    };
  },

  async getMetricsServer(signal?: AbortSignal): Promise<MetricsResponse> {
    const response = await fetch(
      buildServerUrl(N8N_METRICS_WEBHOOK_PATH),
      {
        method: "GET",
        headers: {
          ...authHeaders(),
        },
        signal,
        cache: "no-store",
      },
    );
    const json = await response.json().catch(() => null);
    const parsed = metricsResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error("Invalid metrics response from n8n");
    }
    return parsed.data;
  },

  async getRetrievalItemsServer(
    signal?: AbortSignal,
  ): Promise<RetrievalResponse> {
    const response = await fetch(
      buildServerUrl(N8N_RETRIEVAL_WEBHOOK_PATH),
      {
        method: "GET",
        headers: {
          ...authHeaders(),
        },
        signal,
        cache: "no-store",
      },
    );
    const json = await response.json().catch(() => null);
    const parsed = retrievalResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error("Invalid retrieval response from n8n");
    }
    return parsed.data;
  },

  async triggerWorkflowTestServer(
    workflowId: string,
    signal?: AbortSignal,
  ): Promise<{ ok: boolean; message?: string }> {
    const response = await fetch(
      buildServerUrl(N8N_WORKFLOW_TEST_WEBHOOK_PATH),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ workflowId }),
        signal,
      },
    );

    if (!response.ok) {
      return { ok: false, message: `HTTP ${response.status}` };
    }

    const json = await response.json().catch(() => null);
    if (json && typeof json.message === "string") {
      return { ok: true, message: json.message };
    }
    return { ok: true };
  },

  /**
   * Ask n8n to remove one document from the RAG index by file name.
   * No-op if N8N_ERASE_DOC_WEBHOOK_PATH is not set.
   */
  async eraseDocServer(
    fileName: string,
    signal?: AbortSignal,
  ): Promise<{ ok: boolean; message?: string }> {
    const url = buildEraseDocUrl();
    if (!url) {
      return {
        ok: false,
        message:
          "N8N_ERASE_DOC_WEBHOOK_PATH is not set. In n8n copy the Webhook node’s Production URL (path or full URL) into .env.local.",
      };
    }
    const response = await fetch(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ fileName }),
        signal,
      },
    );
    if (!response.ok) {
      const hint =
        response.status === 404
          ? " Use the URL from an n8n Webhook node (not the Form Trigger). Create a Webhook node, set path if needed (e.g. erase-doc), activate the workflow, then set N8N_ERASE_DOC_WEBHOOK_PATH to that path (e.g. /webhook/XXXXXXXX/erase-doc)."
          : "";
      return {
        ok: false,
        message: `n8n returned HTTP ${response.status}.${hint}`,
      };
    }
    const json = await response.json().catch(() => null);
    if (json && typeof json.message === "string") {
      return { ok: true, message: json.message };
    }
    return { ok: true };
  },

  /**
   * Ask n8n to erase all indexed docs. No-op if N8N_ERASE_DOCS_WEBHOOK_PATH is not set.
   */
  async eraseDocsServer(
    signal?: AbortSignal,
  ): Promise<{ ok: boolean; message?: string }> {
    if (!N8N_ERASE_DOCS_WEBHOOK_PATH) {
      return {
        ok: false,
        message:
          "N8N_ERASE_DOCS_WEBHOOK_PATH is not set. Add a webhook in n8n and set this in .env.local.",
      };
    }
    const response = await fetch(
      buildServerUrl(N8N_ERASE_DOCS_WEBHOOK_PATH),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({}),
        signal,
      },
    );
    if (!response.ok) {
      return { ok: false, message: `n8n returned HTTP ${response.status}` };
    }
    const json = await response.json().catch(() => null);
    if (json && typeof json.message === "string") {
      return { ok: true, message: json.message };
    }
    return { ok: true };
  },
};

/**
 * Browser-facing client that talks to the Next.js proxy routes.
 * These endpoints are safe to call from Client Components.
 */
export const n8n = {
  async queryRag(
    body: ChatRequest,
    _callbacks: SseCallbacks,
    abortSignal?: AbortSignal,
  ) {
    const parsed = chatRequestSchema.parse(body);
    const response = await fetch("/api/proxy/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json,text/plain;q=0.8,*/*;q=0.5",
      },
      body: JSON.stringify({ query: parsed.query }),
      signal: abortSignal,
    });

    if (!response.ok) {
      throw new Error(`Chat request failed with status ${response.status}`);
    }

    const raw = await response.text();
    if (!raw || !raw.trim()) return "";

    try {
      const json = JSON.parse(raw);
      if (!json || typeof json !== "object") return raw.trim();

      const content =
        (typeof json.text === "string" && json.text.trim() && json.text) ||
        (typeof json.output === "string" && json.output.trim() && json.output) ||
        (typeof json.message === "string" && json.message.trim() && json.message) ||
        (typeof json.result === "string" && json.result.trim() && json.result) ||
        (typeof json.response === "string" && json.response.trim() && json.response) ||
        (typeof json.data === "string" && json.data.trim() && json.data) ||
        (typeof (json as { message?: { content?: string } }).message?.content === "string" &&
          (json as { message: { content: string } }).message.content.trim() &&
          (json as { message: { content: string } }).message.content) ||
        (Array.isArray(json.output) &&
          json.output[0] &&
          typeof json.output[0] === "object" &&
          typeof (json.output[0] as { text?: string }).text === "string" &&
          (json.output[0] as { text: string }).text) ||
        (Array.isArray(json.output) &&
          json.output[0] &&
          typeof json.output[0] === "object" &&
          typeof (json.output[0] as { message?: string }).message === "string" &&
          (json.output[0] as { message: string }).message);

      if (content) return content;
      if (json.chatInput && Object.keys(json).length <= 2) return "";

      for (const v of Object.values(json)) {
        if (typeof v === "string" && v.trim().length > 20 && v !== json.chatInput) return v;
      }
      return raw.trim();
    } catch {
      return raw.trim();
    }
  },

  async upload(files: File[]): Promise<UploadResult> {
    const form = new FormData();
    files.forEach((file) => {
      form.append("files", file);
    });

    const response = await fetch("/api/proxy/upload", {
      method: "POST",
      body: form,
    });

    const json = await response.json().catch(() => null);
    const parsed = uploadResultSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error("Invalid upload response from proxy");
    }
    return parsed.data;
  },

  async getMetrics(): Promise<MetricsResponse> {
    const response = await fetch("/api/proxy/metrics", {
      method: "GET",
      cache: "no-store",
    });
    const json = await response.json().catch(() => null);
    const parsed = metricsResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error("Invalid metrics response from proxy");
    }
    return parsed.data;
  },

  async getRetrievalItems(): Promise<RetrievalResponse> {
    const response = await fetch("/api/proxy/retrieval", {
      method: "GET",
      cache: "no-store",
    });
    const json = await response.json().catch(() => null);
    const parsed = retrievalResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error("Invalid retrieval response from proxy");
    }
    return parsed.data;
  },

  async triggerWorkflowTest(
    workflowId: string,
  ): Promise<{ ok: boolean; message?: string }> {
    const response = await fetch("/api/proxy/workflow-test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ workflowId }),
    });

    if (!response.ok) {
      return { ok: false, message: `HTTP ${response.status}` };
    }

    const json = await response.json().catch(() => null);
    if (json && typeof json.message === "string") {
      return { ok: true, message: json.message };
    }
    return { ok: true };
  },

  /**
   * Ask n8n to remove a single document from the RAG index by file name.
   * Requires an n8n webhook at /erase-doc that accepts { fileName: string }.
   */
  async eraseDoc(fileName: string): Promise<{ ok: boolean; message?: string }> {
    const response = await fetch("/api/proxy/erase-doc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain;q=0.8,*/*;q=0.5",
      },
      body: JSON.stringify({ fileName }),
    });

    const json = await response.json().catch(() => null);
    if (!response.ok) {
      const msg =
        (json && typeof json.error === "string" && json.error) ||
        `HTTP ${response.status}`;
      return { ok: false, message: msg };
    }
    if (json && typeof json.message === "string") {
      return { ok: true, message: json.message };
    }
    return { ok: true };
  },
};

