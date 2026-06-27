import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "primary" | "secondary" | "tertiary" | "error";
}

const TONE_CLASSES: Record<NonNullable<ChipProps["tone"]>, string> = {
  neutral: "bg-surface-variant text-on-surface-variant",
  primary: "bg-primary-fixed text-on-primary-fixed-variant",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
  error: "bg-error-container text-on-error-container",
};

export function Chip({ tone = "neutral", className, ...props }: ChipProps) {
  return <span className={cn("chip", TONE_CLASSES[tone], className)} {...props} />;
}
