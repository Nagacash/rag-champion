import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { n8nServer } from "@/lib/n8n-client";
import { chatRequestSchema } from "@/lib/rag-types";

const N8N_BASE_URL =
  process.env.N8N_BASE_URL ?? "https://n8n.srv1157232.hstgr.cloud";

const SERVER_BASE = N8N_BASE_URL.replace(/\/$/, "");

function buildUpstreamUrl(path: string) {
  return `${SERVER_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
    },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ webhook: string[] }> },
) {
  const { webhook } = await context.params;
  const targetPath = `/${webhook.join("/")}`;

  const url = buildUpstreamUrl(targetPath + request.nextUrl.search);

  const upstream = await fetch(url, {
    method: "GET",
    headers: forwardHeaders(request.headers),
    cache: "no-store",
  });

  const responseHeaders = buildResponseHeaders(upstream.headers);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ webhook: string[] }> },
) {
  const { webhook } = await context.params;
  const [firstSegment] = webhook;
  const targetPath = `/${webhook.join("/")}`;

  const isChatEndpoint = firstSegment === "chat";
  const isUploadEndpoint = firstSegment === "upload";
  const isEraseDocEndpoint = firstSegment === "erase-doc";
  const isEraseDocsEndpoint = firstSegment === "erase-docs";
  const acceptHeader = request.headers.get("accept") ?? "";
  const wantsSse = acceptHeader.includes("text/event-stream");

  if (isChatEndpoint) {
    const bodyJson = await request.json().catch(() => null);
    const parsed = chatRequestSchema.safeParse(bodyJson);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid chat payload" },
        { status: 400 },
      );
    }

    const upstream = await n8nServer.queryRagServer(parsed.data);

    if (wantsSse) {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const reader = upstream.body?.getReader();

      if (!reader) {
        writer.close();
        return new NextResponse("Upstream SSE had no body", {
          status: 502,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      }

      (async () => {
        try {
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              await writer.write(value);
            }
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("Error proxying SSE from n8n", err);
        } finally {
          await writer.close();
        }
      })();

      return new NextResponse(readable, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const body = await upstream.text();
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": upstream.headers.get("content-type") ?? "text/plain",
      },
    });
  }

  if (isUploadEndpoint) {
    const form = await request.formData();
    try {
      const result = await n8nServer.uploadFilesServer(form);
      return NextResponse.json(result, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    } catch (error) {
      console.error("[DEBUG] Upload via n8n failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: "Upload failed via n8n webhook", details: errorMessage },
        {
          status: 502,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    }
  }

  if (isEraseDocEndpoint) {
    const bodyJson = await request.json().catch(() => null);
    const fileName =
      bodyJson && typeof bodyJson.fileName === "string"
        ? bodyJson.fileName
        : "";
    if (!fileName.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid fileName" },
        {
          status: 400,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json; charset=utf-8",
          },
        },
      );
    }
    const result = await n8nServer.eraseDocServer(fileName);
    return NextResponse.json(
      result.ok ? { message: result.message ?? "Document removed from index" } : { error: result.message },
      {
        status: result.ok ? 200 : 502,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }

  if (isEraseDocsEndpoint) {
    const result = await n8nServer.eraseDocsServer();
    return NextResponse.json(
      result.ok ? { message: result.message ?? "Index cleared" } : { error: result.message },
      {
        status: result.ok ? 200 : 502,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }

  const url = buildUpstreamUrl(targetPath + request.nextUrl.search);

  const contentType = request.headers.get("content-type") ?? "";
  let body: BodyInit | undefined;

  if (contentType.includes("application/json")) {
    const json = await request.json().catch(() => null);
    body = json ? JSON.stringify(json) : undefined;
  } else if (contentType.startsWith("text/") || contentType === "") {
    const text = await request.text().catch(() => "");
    body = text || undefined;
  } else {
    // Fallback: forward as text; extend if you need other encodings.
    const text = await request.text().catch(() => "");
    body = text || undefined;
  }

  const upstream = await fetch(url, {
    method: "POST",
    headers: forwardHeaders(request.headers),
    body,
  });

  const responseHeaders = buildResponseHeaders(upstream.headers);

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

const N8N_API_KEY = process.env.N8N_API_KEY;

function forwardHeaders(incoming: Headers): HeadersInit {
  const headers: Record<string, string> = {};
  for (const [key, value] of incoming.entries()) {
    if (key.toLowerCase() === "host") continue;
    if (key.toLowerCase() === "content-length") continue;
    headers[key] = value;
  }
  if (N8N_API_KEY) {
    headers["Authorization"] = `Bearer ${N8N_API_KEY}`;
  }
  return {
    ...headers,
  };
}

function buildResponseHeaders(upstreamHeaders: Headers): HeadersInit {
  const headers: Record<string, string> = {
    ...CORS_HEADERS,
  };

  const contentType = upstreamHeaders.get("content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return headers;
}

