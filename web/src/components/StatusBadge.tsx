import type { ArticleStatus } from "../content/articles";
import { cn } from "../lib/cn";

export default function StatusBadge({ status }: { status: ArticleStatus }) {
  const published = status === "published";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-bold",
        published ? "bg-success/15 text-[#56724a]" : "bg-trooper-black/8 text-charcoal/70",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", published ? "bg-success" : "bg-charcoal/40")} />
      {published ? "Published" : "Draft"}
    </span>
  );
}
