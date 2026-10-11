"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BriefSuggestion, RouteSuggestion } from "@/lib/ai/tools";
import type { ProjectBrief } from "@/lib/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "done" | "streaming" | "error" | "cancelled";
  error?: { code: string; message: string; retryable: boolean };
  briefSuggestion?: BriefSuggestion & { state?: "pending" | "applied" | "dismissed" };
  routeSuggestion?: RouteSuggestion;
  notices?: string[];
  grounding?: { id: string; title: string }[];
  mode?: "anthropic" | "demo";
  /** System-style note shown in the thread (e.g. "Brief shared with Kabir"). */
  note?: boolean;
}

export interface Thread {
  staffId: string;
  messages: ChatMessage[];
  /** Visitor's decision about sharing the brief with this guide. */
  briefShare: "unasked" | "shared" | "declined";
  sharedSnapshot?: Partial<ProjectBrief> | null;
}

interface ChatStore {
  sessionId: string;
  threads: Record<string, Thread>;
  activeStaffId: string | null;
  setActive: (id: string | null) => void;
  thread: (staffId: string) => Thread;
  push: (staffId: string, m: ChatMessage) => void;
  patch: (staffId: string, id: string, p: Partial<ChatMessage> | ((m: ChatMessage) => Partial<ChatMessage>)) => void;
  setShare: (staffId: string, v: Thread["briefShare"], snapshot?: Partial<ProjectBrief> | null) => void;
  resetAll: () => string;
}

const newThread = (staffId: string): Thread => ({ staffId, messages: [], briefShare: "unasked" });

export const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

/** Conversations live in sessionStorage: they vanish when the tab closes or on reset. */
export const useChat = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessionId: uid(),
      threads: {},
      activeStaffId: null,
      setActive: (id) => set({ activeStaffId: id }),
      thread: (staffId) => get().threads[staffId] ?? newThread(staffId),
      push: (staffId, m) =>
        set((s) => {
          const t = s.threads[staffId] ?? newThread(staffId);
          return { threads: { ...s.threads, [staffId]: { ...t, messages: [...t.messages, m] } } };
        }),
      patch: (staffId, id, p) =>
        set((s) => {
          const t = s.threads[staffId];
          if (!t) return s;
          return {
            threads: {
              ...s.threads,
              [staffId]: { ...t, messages: t.messages.map((m) => (m.id === id ? { ...m, ...(typeof p === "function" ? p(m) : p) } : m)) },
            },
          };
        }),
      setShare: (staffId, v, snapshot) =>
        set((s) => {
          const t = s.threads[staffId] ?? newThread(staffId);
          return { threads: { ...s.threads, [staffId]: { ...t, briefShare: v, sharedSnapshot: snapshot ?? null } } };
        }),
      resetAll: () => {
        const old = get().sessionId;
        set({ sessionId: uid(), threads: {}, activeStaffId: null });
        return old;
      },
    }),
    {
      name: "sg:chat",
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      partialize: (s) => ({ sessionId: s.sessionId, threads: s.threads }),
      onRehydrateStorage: () => (state) => {
        // Streams can't survive a reload: mark interrupted replies.
        if (!state) return;
        for (const t of Object.values(state.threads)) {
          for (const m of t.messages) if (m.status === "streaming") m.status = "cancelled";
        }
      },
    },
  ),
);
