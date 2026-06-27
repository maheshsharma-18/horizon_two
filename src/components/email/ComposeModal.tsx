"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useComposeModal } from "./ComposeModalProvider";
import { api } from "@/trpc/react";

export function ComposeModal() {
  const { isOpen, close } = useComposeModal();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const sendEmail = api.gmail.sendEmail.useMutation({
    onSuccess: () => {
      setTo("");
      setSubject("");
      setBody("");
      close();
    },
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-surface/80 backdrop-blur-md flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        onKeyDown={(e) => e.key === "Escape" && close()}
      >
        <motion.div
          className="w-full max-w-xl bg-white/90 backdrop-blur-2xl border border-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] rounded-lg overflow-hidden mx-4"
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-on-surface/10">
            <h3 className="font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_square</span> New Message
            </h3>
            <button onClick={close} className="icon-button w-8 h-8">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="p-5 space-y-3">
            <input
              autoFocus
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="To: name@example.com"
              type="email"
              className="w-full border-b border-on-surface/10 pb-2 text-body-sm bg-transparent focus:outline-none focus:border-primary"
            />
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full border-b border-on-surface/10 pb-2 text-body-sm bg-transparent focus:outline-none focus:border-primary"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={8}
              className="w-full text-body-sm bg-transparent focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-on-surface/10 bg-surface-variant/40">
            {sendEmail.isError ? (
              <span className="text-body-xs text-error">{sendEmail.error.message}</span>
            ) : (
              <span className="text-body-xs text-on-surface-variant">
                <kbd className="font-bold">Esc</kbd> to discard
              </span>
            )}
            <button
              onClick={() => sendEmail.mutate({ to, subject, body })}
              disabled={!to.trim() || !subject.trim() || !body.trim() || sendEmail.isPending}
              className="pill-button-primary py-2 px-5 text-body-sm flex items-center gap-2 disabled:opacity-40"
            >
              {sendEmail.isPending ? "Sending..." : "Send"}
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
