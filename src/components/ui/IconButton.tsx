import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string; // Material Symbols Outlined ligature name, e.g. "search"
  label: string; // accessible name, required — icon-only buttons must have one
  size?: number;
}

export function IconButton({ icon, label, size = 22, className, ...props }: IconButtonProps) {
  return (
    <button aria-label={label} title={label} className={cn("icon-button w-10 h-10", className)} {...props}>
      <span className="material-symbols-outlined" style={{ fontSize: size }}>
        {icon}
      </span>
    </button>
  );
}
