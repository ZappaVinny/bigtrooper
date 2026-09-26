import type { ReactNode } from "react";
import { cn } from "../lib/cn";

const widths = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

export default function PageShell({
  title,
  subtitle,
  eyebrow,
  actions,
  width = "lg",
  center = false,
  className,
  children,
}: {
  title?: string;
  subtitle?: ReactNode;
  /** Small line above the title, e.g. a back link. */
  eyebrow?: ReactNode;
  /** Buttons shown beside the title; switches the header to left-aligned. */
  actions?: ReactNode;
  width?: keyof typeof widths;
  center?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const aligned = Boolean(actions || eyebrow);

  return (
    <div
      className={cn(
        "flex flex-col items-center min-h-[calc(100dvh-var(--header-h))] px-4 py-10 md:px-8 md:py-14",
        center && "justify-center",
        className,
      )}
    >
      <div className={cn("flex flex-col w-full gap-8", widths[width])}>
        {title && (
          <header
            className={cn(
              "flex gap-4",
              aligned
                ? "flex-col sm:flex-row sm:items-end sm:justify-between"
                : "flex-col items-center text-center",
            )}
          >
            <div className={cn("flex flex-col gap-2", !aligned && "items-center")}>
              {eyebrow}
              <h1 className="text-4xl md:text-5xl text-trooper-black">{title}</h1>
              {subtitle && <p className="text-charcoal/70">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}
