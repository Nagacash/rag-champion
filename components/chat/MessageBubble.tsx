"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/rag-types";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import type { Components } from "react-markdown";

type Props = {
  message: ChatMessage;
};

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
  h1: ({ children }) => (
    <h1 className="mb-2 mt-4 text-base font-semibold text-slate-100 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-3 text-[0.95rem] font-semibold text-slate-100">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-2 text-[0.9rem] font-medium text-slate-200">
      {children}
    </h3>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 ml-4 list-disc space-y-1 text-slate-200 [&>li]:leading-relaxed">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-4 list-decimal space-y-1 text-slate-200 [&>li]:leading-relaxed">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-50">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-cyan-400/60 bg-slate-800/50 py-1 pl-3 pr-2 text-slate-200 italic">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className ?? "");
    const code = String(children).replace(/\n$/, "");
    if (match) {
      return (
        <SyntaxHighlighter
          PreTag="div"
          style={oneDark}
          language={match[1]}
          customStyle={{
            margin: "0.75rem 0",
            borderRadius: "0.5rem",
            fontSize: "0.8rem",
            padding: "0.75rem 1rem",
          }}
          codeTagProps={{ className: "font-mono" }}
        >
          {code}
        </SyntaxHighlighter>
      );
    }
    return (
      <code
        className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-200"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-300 underline decoration-cyan-400/50 underline-offset-2 hover:text-cyan-200 hover:decoration-cyan-300"
    >
      {children}
    </a>
  ),
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-linear-to-tr from-cyan-400 via-sky-500 to-indigo-500" />
      )}

      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed shadow-lg sm:max-w-[78%]",
          isUser
            ? "bg-linear-to-br from-sky-500 via-cyan-400 to-emerald-400 text-slate-950"
            : "border border-slate-700/80 bg-slate-900/90 text-slate-100",
        )}
      >
        <div
          className={cn(
            "chat-prose max-w-none wrap-break-word",
            isUser && "prose-p:!text-slate-950 prose-headings:!text-slate-900 prose-strong:!text-slate-900",
          )}
        >
          <ReactMarkdown components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        </div>
      </motion.div>
    </div>
  );
}

