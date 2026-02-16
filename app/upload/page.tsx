"use client";

import { useState } from "react";
import { Loader2, Trash2, UploadCloud, Globe } from "lucide-react";
import EraseDocsCard from "@/components/dashboard/EraseDocsCard";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { WebScraper } from "@/components/upload/WebScraper";
import { n8n } from "@/lib/n8n-client";
import { useUploadStore } from "@/lib/upload-store";
import type { UploadedFileEntry } from "@/lib/upload-store";

function UploadHistory() {
  const files = useUploadStore((s) => s.files);
  const removeFile = useUploadStore((s) => s.removeFile);
  const [erasingId, setErasingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRemoveFromIndex(file: UploadedFileEntry) {
    const confirmed = window.confirm(
      `Remove "${file.name}" from the RAG index? This only affects the index; your upload history here stays until you remove it.`,
    );
    if (!confirmed) return;

    setErasingId(file.id);
    setErrorId(null);
    setErrorMessage(null);

    const result = await n8n.eraseDoc(file.name);

    setErasingId(null);
    if (result.ok) {
      removeFile(file.id);
    } else {
      setErrorId(file.id);
      setErrorMessage(result.message ?? "Request failed");
    }
  }

  if (!files.length) {
    return (
      <p className="text-[0.72rem] text-slate-400">
        You haven&apos;t uploaded anything from this device yet. Your next uploads
        will appear here.
      </p>
    );
  }

  return (
    <ul className="space-y-2 text-[0.72rem] text-slate-200">
      {files.slice(0, 6).map((file) => (
        <li
          key={file.id}
          className="flex flex-col gap-1.5 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium">{file.name}</p>
              <p className="mt-0.5 text-[0.68rem] text-slate-400">
                {(file.size / 1024).toFixed(1)} KB ·{" "}
                {new Date(file.uploadedAt).toLocaleTimeString()}
              </p>
            </div>
            <span
              className={
                file.status === "success"
                  ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] text-emerald-200"
                  : "rounded-full bg-rose-500/15 px-2 py-0.5 text-[0.65rem] text-rose-200"
              }
            >
              {file.status === "success" ? "Synced" : "Failed"}
            </span>
          </div>
          {file.status === "success" && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => void handleRemoveFromIndex(file)}
                disabled={erasingId === file.id}
                className="inline-flex items-center gap-1 rounded-full border border-rose-500/50 bg-rose-500/10 px-2 py-1 text-[0.65rem] font-medium text-rose-200 hover:border-rose-400/60 hover:bg-rose-500/20 disabled:opacity-60"
              >
                {erasingId === file.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                {erasingId === file.id ? "Removing…" : "Remove from index"}
              </button>
              {errorId === file.id && (
                <span
                  className="text-[0.65rem] text-rose-300"
                  title={errorMessage ?? undefined}
                >
                  {errorMessage ?? "Failed — check n8n /erase-doc webhook"}
                </span>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function UploadPage() {
  const [tab, setTab] = useState<"file" | "web">("file");

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8 lg:px-10">
      <div className="grain" />
      <div className="grid-overlay" />

      <header className="relative z-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/80">
          First Family · Data Upload
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Feed your RAG memory
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-300/85">
          Drop PDFs, plans, and notes — or scrape any webpage with Gemini AI.
        </p>
      </header>

      <div className="relative z-10 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("file")}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[0.75rem] font-medium transition-colors ${
            tab === "file"
              ? "bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-400/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <UploadCloud className="h-3.5 w-3.5" />
          File Upload
        </button>
        <button
          type="button"
          onClick={() => setTab("web")}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[0.75rem] font-medium transition-colors ${
            tab === "web"
              ? "bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-400/60"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          Web Scrape
        </button>
      </div>

      <section className="relative z-10 grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {tab === "file" ? <UploadDropzone /> : <WebScraper />}

        <aside className="glass-dark flex flex-col justify-between rounded-3xl border border-slate-700/80 bg-slate-950/90 p-4 text-xs text-slate-200">
          <div>
            <h2 className="text-[0.8rem] font-semibold text-slate-50">
              Upload history (this browser)
            </h2>
            <div className="mt-2">
              <UploadHistory />
            </div>
          </div>

          <div className="mt-4 space-y-2 text-[0.7rem] text-slate-300/85">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Best with PDF itineraries, plans, and shared docs.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>Use the Chat page to ask questions once uploaded.</span>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-700/80 pt-4">
            <EraseDocsCard />
          </div>
        </aside>
      </section>
    </main>
  );
}


