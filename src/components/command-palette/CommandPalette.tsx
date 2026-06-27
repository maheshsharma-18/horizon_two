"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { useCommandPalette } from "./CommandPaletteProvider";
import { useComposeModal } from "@/components/email/ComposeModalProvider";
import { api } from "@/trpc/react";
import { formatRelativeTime } from "@/lib/utils";

interface ActionItem {
  id: string;
  icon: string;
  label: string;
  iconClass?: string;
  run: () => void;
}

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const { open: openCompose } = useComposeModal();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  const { data: threads, isFetching } = api.gmail.listThreads.useQuery(
    { query: debounced, limit: 6, offset: 0 },
    { enabled: isOpen && debounced.trim().length > 0 },
  );
  const { data: vector } = api.insights.vectorSearch.useQuery(
    { query: debounced, limit: 6 },
    { enabled: isOpen && debounced.trim().length > 0 },
  );

  const rankedThreads = useMemo(() => {
    if (!threads) return threads;
    if (!vector?.enabled || vector.results.length === 0) return threads;
    const rankByThreadId = new Map(vector.results.map((r, i) => [r.threadId, i]));
    const ranked = threads.filter((t) => rankByThreadId.has(t.id));
    if (ranked.length === 0) return threads;
    return ranked.sort((a, b) => (rankByThreadId.get(a.id) ?? 0) - (rankByThreadId.get(b.id) ?? 0));
  }, [threads, vector]);

  const actions: ActionItem[] = useMemo(
    () => [
      { id: "compose", icon: "edit_square", label: "Compose Email", run: () => openCompose() },
      { id: "agent", icon: "smart_toy", iconClass: "text-corsair-purple", label: "Open Agent Chat", run: () => router.push("/agent") },
      { id: "calendar", icon: "calendar_today", label: "New Calendar Event", run: () => router.push("/calendar?new=1") },
      { id: "settings", icon: "settings", label: "Open Settings", run: () => router.push("/settings") },
    ],
    [router, openCompose],
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-surface/80 backdrop-blur-md flex items-start justify-center pt-[15vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      >
        <motion.div
          className="w-full max-w-2xl bg-white/85 backdrop-blur-2xl border border-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] rounded-lg overflow-hidden mx-4"
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center px-4 py-3 border-b border-on-surface/10">
            <span className="material-symbols-outlined text-on-surface-variant mr-3">search</span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              className="flex-1 bg-transparent border-none focus:ring-0 text-body-lg outline-none placeholder:text-on-surface-variant/60"
              placeholder="Search emails, meetings, people, or ask AI..."
            />
            <span className="text-body-xs font-bold text-on-surface-variant bg-surface-variant px-2 py-1 rounded">ESC</span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {debounced.trim().length > 0 ? (
              <>
                <div className="px-3 py-2 text-body-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {isFetching ? "Searching…" : vector?.enabled ? "Semantic search (vector DB)" : "Fast Search (cached)"}
                </div>
                {rankedThreads?.length === 0 && !isFetching && (
                  <p className="px-3 py-4 text-body-sm text-on-surface-variant">No matches for &ldquo;{query}&rdquo;.</p>
                )}
                {rankedThreads?.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => {
                      close();
                      router.push(`/inbox/${thread.id}`);
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-md hover:bg-primary/10 hover:text-primary transition-colors group"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">mail</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-body-sm text-on-surface truncate">{thread.subject}</div>
                      <div className="text-body-xs text-on-surface-variant truncate">{thread.snippet}</div>
                    </div>
                    {thread.receivedAt && (
                      <span className="text-body-xs text-on-surface-variant shrink-0">
                        {formatRelativeTime(thread.receivedAt)}
                      </span>
                    )}
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="px-3 py-2 text-body-xs font-bold text-on-surface-variant uppercase tracking-wider">Actions</div>
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      close();
                      action.run();
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-variant transition-colors text-body-sm font-medium text-on-surface"
                  >
                    <span className={`material-symbols-outlined text-on-surface-variant ${action.iconClass ?? ""}`}>
                      {action.icon}
                    </span>
                    {action.label}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="bg-surface-variant/50 px-4 py-2 border-t border-on-surface/10 flex items-center justify-between text-body-xs text-on-surface-variant">
            <div className="flex gap-4">
              <span><kbd className="font-bold">↑</kbd> <kbd className="font-bold">↓</kbd> to navigate</span>
              <span><kbd className="font-bold">↵</kbd> to select</span>
            </div>
            <span>Powered by Corsair</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
