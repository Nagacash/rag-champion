"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import type { ChatMessage, SourceChunk } from "@/lib/rag-types";
import { n8n } from "@/lib/n8n-client";
import { useChatStore } from "@/lib/chat-store";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { SourcesTray } from "./SourcesTray";

const TITLE_MAX = 48;

export function ChatStream() {
  const [sources, setSources] = useState<SourceChunk[]>([]);
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const {
    conversations,
    currentId,
    addConversation,
    setCurrent,
    setMessages,
    setTitle,
  } = useChatStore();

  const current = currentId ? conversations.find((c) => c.id === currentId) : null;
  const messages = current?.messages ?? [];

  useEffect(() => {
    if (currentId && !conversations.some((c) => c.id === currentId)) {
      setCurrent(null);
    }
  }, [currentId, conversations, setCurrent]);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (content: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      let convId = currentId;
      if (!convId) {
        convId = addConversation();
      }

      const userMessage: ChatMessage = {
        id: `local-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date(),
      };

      const draftAssistant: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };

      const nextMessages = [...messages, userMessage, draftAssistant];
      setMessages(convId, nextMessages);

      if (messages.length === 0) {
        setTitle(convId, content.slice(0, TITLE_MAX) + (content.length > TITLE_MAX ? "…" : ""));
      }

      const fullAnswer = await n8n.queryRag(
        { query: content },
        {},
        controller.signal,
      );

      setMessages(
        convId,
        nextMessages.map((m) =>
          m.id === draftAssistant.id ? { ...m, content: fullAnswer } : m,
        ),
      );
    },
  });

  return (
    <div className="relative flex h-full flex-col">
      <section className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-3 pt-6 pb-32 sm:px-0 sm:pt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              First Family · Conversation
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
              RAG chat
            </h2>
          </div>
        </div>

        <div className="chat-scrollbar relative flex-1 space-y-3 overflow-y-auto rounded-3xl border border-slate-700/80 bg-slate-950/80 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              Ask a question about your First Family docs to get started.
            </div>
          ) : (
            messages.map((m) => <MessageBubble key={m.id ?? m.content?.slice(0, 12)} message={m} />)
          )}
        </div>
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 pb-5">
        <div className="pointer-events-auto">
          <ChatInput
            disabled={isPending}
            onSend={(value) => {
              sendMessage(value);
            }}
          />
        </div>
      </div>

      <SourcesTray
        sources={sources}
        open={sourcesOpen && sources.length > 0}
        onToggle={() => setSourcesOpen((prev) => !prev)}
      />
    </div>
  );
}
