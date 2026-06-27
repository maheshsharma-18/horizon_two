"use client";

import { useEffect } from "react";

import { useComposeModal } from "@/components/email/ComposeModalProvider";
import { useCommandPalette } from "@/components/command-palette/CommandPaletteProvider";
import { isTypingTarget } from "@/lib/utils";

/**
 * Shortcuts that make sense from anywhere in the app. Page-specific ones
 * (j/k navigate, e archive, r reply) live next to the pages that need them
 * — see InboxList and ThreadShortcuts — since they only make sense in
 * context of a focused list item or open thread.
 */
export function GlobalShortcuts() {
  const { open: openCompose } = useComposeModal();
  const { open: openPalette, isOpen: paletteOpen } = useCommandPalette();

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (isTypingTarget(e.target) || paletteOpen) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "c") {
        e.preventDefault();
        openCompose();
      } else if (e.key === "/") {
        e.preventDefault();
        openPalette();
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [openCompose, openPalette, paletteOpen]);

  return null;
}
