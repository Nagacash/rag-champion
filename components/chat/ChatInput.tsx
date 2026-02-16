"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Paperclip, Send } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  disabled?: boolean;
  onSend: (value: string) => void;
};

export function ChatInput({ disabled, onSend }: Props) {
  const [value, setValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    const scrollHeight = textareaRef.current.scrollHeight;
    textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="relative mx-auto flex w-full max-w-4xl items-end gap-3 rounded-full border border-slate-600/70 bg-slate-900/90 px-3 py-2 shadow-[0_20px_70px_rgba(15,23,42,0.85)]">
      <button
        type="button"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/80 bg-slate-900/90 text-slate-300 transition-colors hover:border-cyan-400/70 hover:text-cyan-200",
          isRecording && "border-rose-500/80 text-rose-300",
        )}
        onClick={() => setIsRecording((prev) => !prev)}
      >
        <Mic className="h-4 w-4" />
      </button>

      <textarea
        ref={textareaRef}
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        placeholder="Ask anything about your family docs, plans, and notes..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        disabled={disabled}
      />

      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/80 bg-slate-900/90 text-slate-300 transition-colors hover:border-cyan-400/70 hover:text-cyan-200"
      >
        <Paperclip className="h-4 w-4" />
      </button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        disabled={disabled || !value.trim()}
        onClick={handleSubmit}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-tr from-cyan-400 via-sky-500 to-indigo-500 text-slate-950 shadow-lg transition-opacity",
          disabled || !value.trim()
            ? "opacity-40"
            : "opacity-100 hover:shadow-[0_0_0_6px_rgba(34,211,238,0.35)]",
        )}
      >
        <Send className="h-4 w-4" />
      </motion.button>
    </div>
  );
}

