import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage } from "@/lib/rag-types";

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
};

type ChatStoreState = {
  conversations: Conversation[];
  currentId: string | null;
  addConversation: (id?: string) => string;
  setCurrent: (id: string | null) => void;
  setMessages: (id: string, messages: ChatMessage[]) => void;
  setTitle: (id: string, title: string) => void;
  removeConversation: (id: string) => void;
  clearAll: () => void;
};

function makeId() {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentId: null,

      addConversation(id) {
        const newId = id ?? makeId();
        const conv: Conversation = {
          id: newId,
          title: "New chat",
          createdAt: new Date().toISOString(),
          messages: [],
        };
        set((state) => ({
          conversations: [conv, ...state.conversations].slice(0, 50),
          currentId: newId,
        }));
        return newId;
      },

      setCurrent(id) {
        set({ currentId: id });
      },

      setMessages(conversationId, messages) {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, messages } : c,
          ),
        }));
      },

      setTitle(conversationId, title) {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, title } : c,
          ),
        }));
      },

      removeConversation(id) {
        const { currentId } = get();
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentId: currentId === id ? null : currentId,
        }));
      },

      clearAll() {
        set({ conversations: [], currentId: null });
      },
    }),
    {
      name: "first-family-chat-history",
      partialize: (state) => ({
        conversations: state.conversations,
        currentId: state.currentId,
      }),
    },
  ),
);
