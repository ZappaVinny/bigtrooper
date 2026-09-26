import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export default function FormMessage({
  tone = "error",
  children,
  className,
}: {
  tone?: "error" | "success";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "w-full rounded-xl border px-4 py-2.5 text-sm font-medium",
        tone === "error"
          ? "border-danger/30 bg-danger/10 text-danger"
          : "border-success/30 bg-success/10 text-[#56724a]",
        className,
      )}
    >
      {children}
    </div>
  );
}
