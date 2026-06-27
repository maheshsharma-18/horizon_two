import { clsx, type ClassValue } from "clsx";
import type { Priority } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (Math.abs(diffMin) < 1) return "just now";
  if (Math.abs(diffMin) < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export const priorityStyles: Record<
  Priority,
  { dot: string; chip: string; label: string }
> = {
  high: { dot: "bg-error", chip: "bg-error-container text-on-error-container", label: "High" },
  medium: { dot: "bg-primary", chip: "bg-primary-fixed text-on-primary-fixed-variant", label: "Medium" },
  low: { dot: "bg-on-surface-variant", chip: "bg-surface-variant text-on-surface-variant", label: "Low" },
};

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Parses Gmail's "Name <email@x.com>" header format into parts. Falls back to treating the whole string as both if it doesn't match. */
export function parseNameEmail(raw: string): { name: string; email: string } {
  const match = /^(.*?)\s*<(.+)>$/.exec(raw.trim());
  if (match) {
    const name = match[1].replace(/"/g, "").trim();
    return { name: name || match[2], email: match[2] };
  }
  return { name: raw, email: raw };
}

/**
 * True when a keyboard event's target is a text input, so single-key
 * shortcuts (e, r, j, k, c...) don't fire while the user is typing —
 * the one rule every Superhuman-style shortcut system depends on.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}
