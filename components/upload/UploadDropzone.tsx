"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { UploadCloud, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { n8n } from "@/lib/n8n-client";
import type { UploadResult } from "@/lib/rag-types";
import { useUploadStore } from "@/lib/upload-store";

type Props = {
  onUploaded?: (result: UploadResult) => void;
};

export function UploadDropzone({ onUploaded }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hovering, setHovering] = useState(false);
  const addBatch = useUploadStore((s) => s.addBatch);
  const {
    mutateAsync,
    isPending,
    isSuccess,
    isError,
    data,
    error,
  } = useMutation({
    mutationFn: (files: File[]) => n8n.upload(files),
    onSuccess: (_result, files) => {
      addBatch(
        files.map((file) => ({
          name: file.name,
          size: file.size,
          success: true,
        })),
      );
    },
    onError: (_err, files) => {
      if (!files) return;
      addBatch(
        files.map((file) => ({
          name: file.name,
          size: file.size,
          success: false,
        })),
      );
    },
  });

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length || isPending) return;
      const list = Array.from(files);
      const result = await mutateAsync(list);
      onUploaded?.(result);
    },
    [isPending, mutateAsync, onUploaded],
  );

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={false}
        animate={{
          borderColor: hovering ? "rgba(34,211,238,0.7)" : "rgba(148,163,184,0.6)",
          background:
            "radial-gradient(circle at top, rgba(34,211,238,0.18), transparent 55%)",
        }}
        className="glass-dark relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center text-sm text-slate-200"
        onDragOver={(e) => {
          e.preventDefault();
          setHovering(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setHovering(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setHovering(false);
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="mb-4 flex items-center justify-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-slate-900/90 shadow-[0_0_0_6px_rgba(15,23,42,0.9)]">
            <UploadCloud className="h-7 w-7 text-cyan-300" />
          </div>
        </div>
        <p className="text-[0.8rem] font-medium text-slate-50">
          Drag &amp; drop PDFs, docs, or notes
        </p>
        <p className="mt-1 text-[0.72rem] text-slate-400">
          Your files are sent directly to the First Family n8n RAG workflow for
          indexing.
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 inline-flex cursor-pointer items-center rounded-full bg-slate-900/80 px-4 py-1.5 text-[0.72rem] font-medium text-cyan-100 ring-1 ring-cyan-400/60 hover:ring-cyan-300"
        >
          Browse files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </motion.div>

      <div className="min-h-10 text-[0.72rem] text-slate-300">
        {isPending && (
          <div className="inline-flex items-center gap-1 rounded-full border border-slate-600/80 bg-slate-900/80 px-3 py-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />
            <span>Uploading to n8n workflow…</span>
          </div>
        )}
        {isSuccess && data && (
          <div className="inline-flex items-center gap-1 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-emerald-100">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              Ingested {data.processedFiles}/{data.totalFiles} files via RAG
              pipeline.
            </span>
          </div>
        )}
        {isError && (
          <div className="inline-flex items-center gap-1 rounded-full border border-rose-500/60 bg-rose-500/10 px-3 py-1 text-rose-100">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Upload failed. Check the n8n upload webhook URL.</span>
            {error instanceof Error && (
              <span className="ml-1 text-[0.68rem] text-rose-200/80">
                ({error.message})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

