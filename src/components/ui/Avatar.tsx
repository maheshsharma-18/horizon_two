import { initialsFromName } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center font-semibold shrink-0",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initialsFromName(name)}
    </div>
  );
}
