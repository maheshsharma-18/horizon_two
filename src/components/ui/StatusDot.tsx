import { cn } from "@/lib/utils";

export function StatusDot({ active, pulse = false }: { active: boolean; pulse?: boolean }) {
  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full",
        active ? "bg-secondary" : "bg-outline-variant",
        active && pulse && "sync-pulse text-secondary"
      )}
    />
  );
}
