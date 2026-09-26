import type { ReactNode } from "react";
import { cn } from "../lib/cn";

const tones = {
  light: "bg-cream-50 border-line text-trooper-black",
  dark: "bg-charcoal border-white/5 text-cream",
  tan: "bg-trooper-tan border-trooper-black/10 text-trooper-black",
};

export default function Card({
  children,
  className,
  tone = "light",
  onClick,
}: {
  children?: ReactNode;
  className?: string;
  tone?: keyof typeof tones;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn("rounded-2xl border shadow-card", tones[tone], className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
