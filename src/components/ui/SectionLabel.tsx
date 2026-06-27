import { cn } from "@/lib/utils";

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-label-caps text-label-caps uppercase text-on-surface-variant", className)}>
      {children}
    </p>
  );
}
