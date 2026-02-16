"use client";

import { useState, useTransition } from "react";
import { Globe, Loader2, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { scrapeWeb, type ScrapeResult } from "@/app/actions/gemini-scrape";

export function WebScraper() {
  const [url, setUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!result?.markdown) return;
    navigator.clipboard.writeText(result.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleScrape() {
    if (!url.trim() || isPending) return;
    setResult(null);
    startTransition(async () => {
      const res = await scrapeWeb(url.trim());
      setResult(res);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-dark relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-600/60 px-6 py-10 text-center text-sm text-slate-200">
        <div className="mb-4 flex items-center justify-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-900/90 shadow-[0_0_0_6px_rgba(15,23,42,0.9)]">
            <Globe className="h-7 w-7 text-cyan-300" />
          </div>
        </div>
        <p className="text-[0.8rem] font-medium text-slate-50">
          Scrape a webpage or research anything
        </p>
        <p className="mt-1 text-[0.72rem] text-slate-400">
          Paste a URL to extract content, or ask any question — powered by
          Gemini AI.
        </p>

        <div className="mt-4 flex w-full max-w-md gap-2">
          <input
            type="text"
            placeholder="URL or query, e.g. &quot;nail salons without a website in Berlin&quot;"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScrape()}
            className="flex-1 rounded-full border border-slate-600/70 bg-slate-900/80 px-4 py-2 text-[0.78rem] text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleScrape}
            disabled={isPending || !url.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-4 py-2 text-[0.72rem] font-medium text-cyan-100 ring-1 ring-cyan-400/60 hover:ring-cyan-300 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Globe className="h-3.5 w-3.5" />
            )}
            {isPending ? "Working…" : "Go"}
          </button>
        </div>
      </div>

      <div className="min-h-10 text-[0.72rem] text-slate-300">
        {result?.success && (
          <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-emerald-100">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              Scraped {result.chunks} chunks from {result.url}
            </span>
          </div>
        )}
        {result && !result.success && (
          <div className="inline-flex items-center gap-1 rounded-full border border-rose-500/60 bg-rose-500/10 px-3 py-1 text-rose-100">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Scrape failed.</span>
            {result.error && (
              <span className="ml-1 text-[0.68rem] text-rose-200/80">
                ({result.error})
              </span>
            )}
          </div>
        )}
      </div>

      {result?.success && result.markdown && (
        <div className="glass-dark max-h-[32rem] overflow-y-auto rounded-3xl border border-slate-700/80 bg-slate-950/90 p-5 sm:p-6 chat-scrollbar">
          <div className="mb-3 flex items-center gap-2 border-b border-slate-700/60 pb-3">
            <Globe className="h-4 w-4 text-cyan-300" />
            <span className="text-[0.72rem] font-semibold text-slate-50">
              {/^https?:\/\//.test(result.url)
                ? new URL(result.url).hostname
                : "Gemini Research"}
            </span>
            <span className="ml-auto flex items-center gap-2 text-[0.65rem] text-slate-500">
              {result.chunks} chunks
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-full border border-slate-600/60 px-2 py-0.5 text-[0.65rem] text-slate-300 hover:border-cyan-400/50 hover:text-cyan-200 transition-colors"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </span>
          </div>
          <div className="scrape-prose text-[0.8rem] leading-[1.7] text-slate-200">
            <ReactMarkdown>{result.markdown}</ReactMarkdown>
          </div>
          <div className="mt-4 border-t border-slate-700/40 pt-3 text-[0.65rem] text-slate-500">
            ⚠ AI-generated summary — always verify facts like addresses, phone
            numbers, and prices directly on the source website.
          </div>
        </div>
      )}
    </div>
  );
}
