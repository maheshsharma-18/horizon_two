"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/trpc/react";
import { isTypingTarget } from "@/lib/utils";

export function ThreadShortcuts({ threadId }: { threadId: string }) {
  const router = useRouter();
  const archiveThread = api.gmail.archiveThread.useMutation({
    onSuccess: () => router.push("/inbox"),
  });

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      if (e.key === "r") {
        e.preventDefault();
        document.getElementById("reply-textarea")?.focus();
      } else if (e.key === "e") {
        e.preventDefault();
        archiveThread.mutate({ threadId });
      } else if (e.key === "Escape") {
        router.push("/inbox");
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [threadId, archiveThread, router]);

  return null;
}
