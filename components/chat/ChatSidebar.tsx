"use client";

import { MessageSquarePlus, Trash2 } from "lucide-react";
import { useChatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

const MAX_TITLE_LEN = 36;

function formatTitle(title: string) {
  if (title.length <= MAX_TITLE_LEN) return title;
  return title.slice(0, MAX_TITLE_LEN - 3) + "…";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ChatSidebar() {
  const {
    conversations,
    currentId,
    addConversation,
    setCurrent,
    clearAll,
  } = useChatStore();

  const handleNewChat = () => {
    addConversation();
  };

  const handleClear = () => {
    if (typeof window !== "undefined" && window.confirm("Erase all chat history in this browser?")) {
      clearAll();
    }
  };

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-700/60 bg-slate-900/60">
      <div className="flex items-center gap-2 border-b border-slate-700/60 p-2">
        <button
          type="button"
          onClick={handleNewChat}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500/20 px-3 py-2 text-[0.8rem] font-medium text-cyan-200 hover:bg-cyan-500/30"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="chat-scrollbar flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="px-2 py-4 text-center text-[0.7rem] text-slate-500">
            No conversations yet
          </p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setCurrent(c.id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-[0.8rem] transition-colors",
                    currentId === c.id
                      ? "bg-cyan-500/25 text-cyan-100"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100",
                  )}
                >
                  <span className="block truncate">{formatTitle(c.title)}</span>
                  <span className="mt-0.5 block text-[0.65rem] text-slate-500">
                    {formatDate(c.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {conversations.length > 0 && (
        <div className="border-t border-slate-700/60 p-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[0.75rem] font-medium text-rose-200 hover:bg-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear history
          </button>
        </div>
      )}
    </aside>
  );
}
