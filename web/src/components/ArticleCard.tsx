import { Link } from "react-router-dom";
import type { Article } from "../content/articles";
import { formatDate, readingMinutes } from "../content/articles";
import { cn } from "../lib/cn";
import { ArrowRightIcon } from "./icons";

export default function ArticleCard({
  article,
  featured = false,
}: {
  article: Article;
  featured?: boolean;
}) {
  return (
    <Link
      to={`/articles/${article.slug}`}
      className={cn(
        "focus-ring group flex h-full flex-col gap-3 rounded-2xl border shadow-card transition-shadow hover:shadow-menu",
        featured
          ? "border-transparent bg-trooper-black p-7 text-cream md:p-10"
          : "border-line bg-cream-50 p-6 text-trooper-black",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 uppercase tracking-[0.12em]",
            featured ? "bg-trooper-amber text-cream" : "bg-trooper-tan/35 text-trooper-amber",
          )}
        >
          {article.category}
        </span>
        <span className={featured ? "text-cream/60" : "text-charcoal/50"}>
          {formatDate(article.date)} · {readingMinutes(article)} min read
        </span>
      </div>
      <h2
        className={cn(
          "leading-tight",
          featured ? "text-3xl md:text-5xl" : "text-2xl",
        )}
      >
        {article.title}
      </h2>
      <p
        className={cn(
          "line-clamp-3 leading-relaxed",
          featured ? "max-w-2xl text-cream/70 md:text-lg" : "text-sm text-charcoal/70",
        )}
      >
        {article.excerpt}
      </p>
      <span
        className={cn(
          "mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-bold",
          featured ? "text-trooper-tan" : "text-trooper-amber",
        )}
      >
        Read article
        <ArrowRightIcon width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
