"use client";

import { useCommandPalette } from "@/components/command-palette/CommandPaletteProvider";
import { IconButton } from "@/components/ui/IconButton";
import { Avatar } from "@/components/ui/Avatar";

export function TopBar() {
  const { open } = useCommandPalette();

  return (
    <header className="h-16 border-b border-white/20 flex items-center justify-between px-6 bg-white/10 backdrop-blur-sm z-10 flex-shrink-0">
      <button
        onClick={open}
        className="flex items-center gap-3 text-on-surface-variant bg-white/40 border border-white/60 hover:bg-white/60 px-4 py-1.5 rounded-full transition-colors w-full max-w-md shadow-sm"
      >
        <span className="material-symbols-outlined text-[18px]">search</span>
        <span className="text-body-sm truncate">Search emails, meetings, people or ask AI...</span>
        <span className="ml-auto text-body-xs bg-white/60 px-1.5 rounded border border-white/70 shrink-0">⌘K</span>
      </button>
      <div className="flex items-center gap-3 ml-4 shrink-0">
        <IconButton icon="notifications" label="Notifications" className="bg-white/40 border border-white/60" />
        <Avatar name="You" size={40} className="border-2 border-white/80 shadow-sm" />
      </div>
    </header>
  );
}
