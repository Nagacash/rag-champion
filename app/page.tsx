import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-16 sm:px-8 lg:px-16">
      <div className="grain" />
      <div className="grid-overlay" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-10 lg:flex-row lg:items-center">
        <section className="glass-dark relative flex-1 rounded-3xl border border-cyan-500/30 bg-slate-900/70 p-8 shadow-2xl sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute inset-px rounded-[22px] border border-white/5" />
          <div className="absolute -inset-px -z-10 rounded-[26px] opacity-60 blur-3xl rainbow-accent" />

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-900/60 px-3 py-1 text-xs font-medium text-cyan-100/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(34,197,94,0.35)]" />
            Live · First Family RAG on n8n
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
            Your family&apos;s{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              private AI
            </span>{" "}
            that actually remembers.
          </h1>

          <p className="mt-5 max-w-xl text-balance text-sm text-slate-300/80 sm:text-base">
            Ask anything about your documents, voice notes, and plans. First
            Family RAG runs on n8n, streams answers token-by-token, and shows
            exactly which sources it used.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/query"
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_20px_60px_rgba(8,47,73,0.6)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(8,47,73,0.9)]"
            >
              <span className="absolute inset-px rounded-full bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <span className="relative flex items-center gap-2">
                New intelligent query
                <span className="h-1.5 w-4 rounded-full bg-white/80" />
              </span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-600/70 bg-slate-900/60 px-5 py-2.5 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-cyan-100"
            >
              View RAG dashboard
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 text-xs text-slate-300/80 sm:grid-cols-3 sm:text-[0.72rem]">
            <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-b from-emerald-500/10 to-emerald-500/0 p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-emerald-300/80">
                Docs indexed
              </p>
              <p className="mt-1 text-lg font-semibold text-emerald-100">
                1,204
              </p>
              <p className="text-[0.68rem] text-emerald-200/80">
                Synced via n8n RAG workflow
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-cyan-500/10 to-cyan-500/0 p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-cyan-200/80">
                Queries answered
              </p>
              <p className="mt-1 text-lg font-semibold text-cyan-100">
                18,342
              </p>
              <p className="text-[0.68rem] text-cyan-100/80">
                Streaming, source-grounded answers
              </p>
            </div>
            <div className="rounded-2xl border border-sky-400/30 bg-gradient-to-b from-sky-500/10 to-sky-500/0 p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-sky-200/80">
                Avg latency
              </p>
              <p className="mt-1 text-lg font-semibold text-sky-100">
                1.2s
              </p>
              <p className="text-[0.68rem] text-sky-100/80">
                Powered by First Family on n8n
              </p>
            </div>
          </div>
        </section>

        <aside className="relative mt-6 flex-1 lg:mt-0">
          <div className="glass-dark relative flex h-full min-h-[320px] flex-col justify-between rounded-3xl border border-sky-400/40 bg-slate-900/80 p-5 text-xs shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-500 shadow-[0_0_0_6px_rgba(8,47,73,0.7)]">
                  <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-white/90" />
                </div>
                <div>
                  <p className="text-[0.7rem] font-semibold text-slate-100">
                    First Family Assistant
                  </p>
                  <p className="text-[0.65rem] text-slate-400">
                    Streaming from n8n RAG
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-2 py-1 text-[0.62rem] font-medium text-emerald-200">
                Online
              </span>
            </div>

            <div className="chat-scrollbar relative mb-4 flex-1 space-y-3 overflow-hidden overflow-y-auto rounded-2xl border border-slate-700/70 bg-slate-950/70 p-3">
              <div className="flex justify-end">
                <div className="max-w-[70%] rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-400 to-emerald-400 px-3 py-2 text-[0.7rem] font-medium text-slate-950 shadow-lg">
                  What did we decide about our summer travel dates?
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 h-6 w-6 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-500" />
                <div className="max-w-[80%] rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-[0.7rem] text-slate-100">
                  You&apos;re planning to be in{" "}
                  <span className="font-semibold text-cyan-200">
                    Barcelona from July 8–14
                  </span>
                  , then spend a week in{" "}
                  <span className="font-semibold text-cyan-200">
                    Lisbon (July 14–21)
                  </span>
                  . I pulled this from your shared{" "}
                  <span className="font-medium text-emerald-200">
                    “Summer 2026 – Master Plan”
                  </span>{" "}
                  doc and the Airbnb booking confirmations.
                </div>
              </div>
            </div>

            <div className="mt-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-[0.7rem] text-slate-400">
              <span className="mr-2 inline-flex h-5 w-10 items-center justify-center rounded-full bg-slate-800/80 text-[0.6rem] font-medium text-slate-200">
                Tip
              </span>
              Ask: “What&apos;s everything we still need to book for this
              trip?”
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

