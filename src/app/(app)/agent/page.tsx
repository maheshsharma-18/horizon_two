"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/agent/ChatMessage";
import type { AgentMessage } from "@/lib/types";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AgentChatPage() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isSending) return;

    const userMessage: AgentMessage = { id: newId(), role: "user", text, createdAt: new Date().toISOString() };
    const pendingId = newId();
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: pendingId, role: "assistant", text: "", createdAt: new Date().toISOString(), toolCalls: [{ id: "pending", tool: "search_emails", label: "Thinking...", status: "running" }] },
    ]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { ...m, text: data.reply ?? "Done.", toolCalls: data.toolCalls ?? [] }
            : m,
        ),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { ...m, text: "Something went wrong reaching the agent backend.", toolCalls: [] }
            : m,
        ),
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto relative">
      {messages.length === 0 && (
        <div className="text-center mb-8 pt-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-corsair-blue to-corsair-purple mx-auto flex items-center justify-center mb-4 shadow-lg">
            <span className="material-symbols-outlined text-white text-3xl">smart_toy</span>
          </div>
          <h1 className="text-headline-lg font-bold mb-2">Corsair MCP Agent</h1>
          <p className="text-on-surface-variant">I have access to your Gmail and Calendar. What do you need?</p>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pb-24 px-4">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
      </div>

      <div className="sticky bottom-0 left-0 right-0 px-4 pb-2 pt-4 bg-gradient-to-t from-background via-background/90 to-transparent">
        <div className="glass-card rounded-full p-2 flex items-center shadow-lg bg-white/80">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            type="text"
            placeholder="Ask the agent to schedule, reply, or summarize..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-body-sm px-3 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="w-10 h-10 rounded-full bg-on-surface text-inverse-on-surface flex items-center justify-center hover:opacity-80 transition-opacity shadow-sm disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
