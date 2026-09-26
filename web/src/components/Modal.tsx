import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { useDismiss } from "../lib/useDismiss";

export default function Modal({
  children,
  className,
  onClose,
  labelledBy,
}: {
  children?: ReactNode;
  className?: string;
  onClose?: () => void;
  labelledBy?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(panelRef, true, () => onClose?.());

  // Move focus into the dialog and lock page scroll while it's open.
  useEffect(() => {
    panelRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-trooper-black/50 p-4 backdrop-blur-[2px]">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn(
          "flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-cream-50 shadow-menu outline-none",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
