import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}

export function PillButton({
  className,
  variant = "primary",
  size = "md",
  ...props
}: PillButtonProps) {
  return (
    <button
      className={cn(
        variant === "primary" && "pill-button-primary",
        variant === "secondary" && "pill-button-secondary",
        variant === "ghost" && "text-on-surface-variant hover:text-primary transition-colors duration-200 rounded-full px-4 py-2",
        size === "sm" && "text-body-sm px-4 py-2",
        className
      )}
      {...props}
    />
  );
}
