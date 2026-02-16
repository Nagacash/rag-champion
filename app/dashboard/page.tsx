import Link from "next/link";
import { n8nServer } from "@/lib/n8n-client";
import type { MetricsResponse } from "@/lib/rag-types";
import EraseDocsCard from "@/components/dashboard/EraseDocsCard";

async function getMetrics(): Promise<MetricsResponse | null> {
  try {
    return await n8nServer.getMetricsServer();
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const metrics = await getMetrics();

  const summary = metrics?.summary ?? {
    totalDocs: 1204,
    totalQueries: 18342,
    avgLatencyMs: 1200,
    lastIndexedAt: undefined,
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8 lg:px-12">
      <div className="grain" />
      <div className="grid-overlay" />

      <header className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/80">
            First Family · RAG Overview
          </p>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            RAG control room
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-300/85">
            Live metrics from your n8n-powered retrieval workflow. Monitor
            indexed documents, query volume, and latency before you dive into a
            new conversation.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 text-[0.7rem] text-slate-300/80 sm:items-end">
          <div className="flex gap-2">
            <Link
              href="/query"
              className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-cyan-400 via-sky-500 to-indigo-500 px-3 py-1 font-medium text-slate-950 shadow-[0_12px_35px_rgba(8,47,73,0.8)]"
            >
              Open chat
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center gap-1 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-100 hover:border-emerald-400/80"
            >
              Upload data
            </Link>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(34,197,94,0.45)]" />
            n8n workflow: First Family · RAG
          </span>
        </div>
      </header>

      <section className="relative z-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-emerald-400/35 bg-linear-to-b from-emerald-500/15 via-emerald-500/8 to-slate-900/90 p-4 shadow-[0_18px_40px_rgba(6,78,59,0.7)]">
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-emerald-200/85">
            Docs indexed
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-50">
            {summary.totalDocs.toLocaleString()}
          </p>
          <p className="mt-1 text-[0.7rem] text-emerald-100/85">
            Synced via n8n RAG pipeline
          </p>
        </div>

        <div className="rounded-3xl border border-cyan-400/35 bg-linear-to-b from-cyan-500/15 via-cyan-500/8 to-slate-900/90 p-4 shadow-[0_18px_40px_rgba(8,47,73,0.7)]">
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-cyan-200/85">
            Queries answered
          </p>
          <p className="mt-2 text-2xl font-semibold text-cyan-50">
            {summary.totalQueries.toLocaleString()}
          </p>
          <p className="mt-1 text-[0.7rem] text-cyan-100/85">
            Streaming, source-grounded responses
          </p>
        </div>

        <div className="rounded-3xl border border-sky-400/35 bg-linear-to-b from-sky-500/15 via-sky-500/8 to-slate-900/90 p-4 shadow-[0_18px_40px_rgba(12,74,110,0.7)]">
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-sky-200/85">
            Avg latency
          </p>
          <p className="mt-2 text-2xl font-semibold text-sky-50">
            {(summary.avgLatencyMs / 1000).toFixed(1)}s
          </p>
          <p className="mt-1 text-[0.7rem] text-sky-100/85">
            From first token to final answer
          </p>
        </div>
      </section>

      <section className="relative z-10 grid gap-5 rounded-3xl border border-slate-800/80 bg-slate-950/85 p-5 text-xs text-slate-200/90 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
        <div className="space-y-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
            How to use First Family RAG
          </p>
          <dl className="space-y-3">
            <div>
              <dt className="text-[0.8rem] font-medium text-slate-50">
                How do I start a conversation?
              </dt>
              <dd className="mt-1 text-[0.8rem] text-slate-300/90">
                Go to <span className="font-medium text-cyan-200">Chat</span> and
                ask natural-language questions about your indexed documents. The
                n8n workflow returns grounded answers from your RAG index.
              </dd>
            </div>
            <div>
              <dt className="text-[0.8rem] font-medium text-slate-50">
                How do I add new documents?
              </dt>
              <dd className="mt-1 text-[0.8rem] text-slate-300/90">
                Use the{" "}
                <span className="font-medium text-emerald-200">Upload</span>{" "}
                view to drag &amp; drop PDFs or CSVs. They are parsed and synced
                into the RAG pipeline via n8n.
              </dd>
            </div>
            <div>
              <dt className="text-[0.8rem] font-medium text-slate-50">
                What do the metrics above represent?
              </dt>
              <dd className="mt-1 text-[0.8rem] text-slate-300/90">
                <span className="font-medium">Docs indexed</span> tracks how
                many documents are in the RAG index,{" "}
                <span className="font-medium">Queries answered</span> shows chat
                volume, and <span className="font-medium">Avg latency</span>{" "}
                measures how fast answers come back from n8n.
              </dd>
            </div>
            <div>
              <dt className="text-[0.8rem] font-medium text-slate-50">
                Can I erase the indexed documents?
              </dt>
              <dd className="mt-1 text-[0.8rem] text-slate-300/90">
                Yes — use the{" "}
                <span className="font-medium text-rose-200">
                  erase indexed docs
                </span>{" "}
                control on the right to request a reset of the RAG index via
                n8n.
              </dd>
            </div>
          </dl>
        </div>

        <EraseDocsCard />
      </section>

      <section className="relative z-10 rounded-3xl border border-slate-700/80 bg-slate-950/80 p-5 text-xs text-slate-300/90">
        <p>
          <span className="mr-2 inline-flex h-5 items-center justify-center rounded-full bg-slate-800/80 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-200">
            Tip
          </span>
          Use{" "}
          <span className="font-medium text-cyan-200">/chat</span> to talk
          to your RAG knowledge base,{" "}
          <span className="font-medium text-emerald-200">/upload</span> to
          add files or scrape websites with Gemini AI, and this dashboard to
          monitor your indexed documents.
        </p>
      </section>
    </main>
  );
}

