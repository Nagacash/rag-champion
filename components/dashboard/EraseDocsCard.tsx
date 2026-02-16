"use client";

import { useState } from "react";

type Status = "idle" | "working" | "success" | "error";

export default function EraseDocsCard() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const isWorking = status === "working";

  async function handleErase() {
    const confirmed = window.confirm(
      "Erase indexed docs from the RAG store? This cannot be undone.",
    );
    if (!confirmed) return;

    setStatus("working");
    setMessage(null);

    try {
      const res = await fetch("/api/proxy/erase-docs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain;q=0.8,*/*;q=0.5",
        },
        body: JSON.stringify({}),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          (json && typeof json.error === "string" && json.error) ||
          `HTTP ${res.status}`;
        setStatus("error");
        setMessage(msg);
        return;
      }

      const text =
        (json && (json.message as string | undefined)) ??
        "Erase request sent to n8n. The RAG index will be cleared according to your workflow.";
      setStatus("success");
      setMessage(text);
    } catch (error) {
      console.error("Failed to erase docs via n8n", error);
      setStatus("error");
      setMessage(
        "Failed to erase docs. Check the n8n erase webhook and try again.",
      );
    }
  }

  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-rose-500/45 bg-linear-to-b from-rose-500/20 via-rose-500/10 to-slate-950/95 p-4 shadow-[0_18px_40px_rgba(127,29,29,0.8)]">
      <div className="space-y-1.5">
        <p className="inline-flex items-center gap-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-rose-100/90">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-300 shadow-[0_0_0_3px_rgba(248,113,113,0.6)]" />
          Danger zone
        </p>
        <p className="text-[0.82rem] font-medium text-rose-50">
          Erase indexed docs
        </p>
        <p className="text-[0.78rem] text-rose-100/85">
          Sends a delete request to your n8n workflow to clear the current RAG
          index. Make sure your erase webhook is wired before using this.
        </p>
      </div>

      <div className="mt-2 space-y-1.5">
        <button
          type="button"
          onClick={handleErase}
          disabled={isWorking}
          className="inline-flex w-full items-center justify-center rounded-full bg-linear-to-r from-rose-400 via-red-500 to-amber-500 px-3 py-1.5 text-[0.8rem] font-semibold text-slate-950 shadow-[0_16px_45px_rgba(127,29,29,0.85)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isWorking ? "Erasing…" : "Erase indexed docs"}
        </button>

        {message && (
          <p
            className="text-[0.72rem]"
            aria-live="polite"
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

