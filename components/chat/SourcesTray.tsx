"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SourceChunk } from "@/lib/rag-types";

type Props = {
  sources: SourceChunk[];
  open: boolean;
  onToggle: () => void;
};

export function SourcesTray({ sources, open, onToggle }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-3 pb-3 sm:px-6 sm:pb-5">
      <div className="pointer-events-auto w-full max-w-4xl">
        <button
          onClick={onToggle}
          className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-600/70 bg-slate-900/90 px-3 py-1.5 text-[0.7rem] font-medium text-slate-200/90 hover:border-cyan-400/70 hover:text-cyan-100"
        >
          <span className="h-1 w-8 rounded-full bg-slate-500/80" />
          {open ? "Hide sources" : "Show sources"}
        </button>

        <AnimatePresence initial={false}>
          {open && sources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="glass-dark max-h-64 overflow-hidden overflow-y-auto rounded-3xl border border-slate-700/80 bg-slate-950/90 p-3 text-xs text-slate-100 chat-scrollbar"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {sources.map((src) => (
                  <article
                    key={src.id}
                    className="flex flex-col gap-1 rounded-2xl border border-slate-700/80 bg-slate-900/70 p-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-[0.7rem] font-semibold text-slate-50">
                        {src.title ?? "Source"}
                      </p>
                      <ScorePill score={src.score} />
                    </div>
                    <p className="line-clamp-3 text-[0.68rem] text-slate-300/90">
                      {src.snippet}
                    </p>
                  </article>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const color = score > 0.8 ? "bg-emerald-400" : score < 0.6 ? "bg-orange-400" : "bg-cyan-400";

  return (
    <div className="flex items-center gap-1 text-[0.65rem] text-slate-200">
      <div className={cn("h-1.5 w-10 rounded-full", color)} />
      <span>{(score * 100).toFixed(0)}%</span>
    </div>
  );
}

