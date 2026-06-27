import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  hover?: boolean;
}

/** The one card recipe used everywhere — frosted glass, soft border, gentle elevation on hover. */
export function GlassCard({ className, padded = true, hover = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card",
        padded && "p-card-internal",
        hover && "transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]",
        className
      )}
      {...props}
    />
  );
}
