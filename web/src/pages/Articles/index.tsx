import { useState } from "react";
import PageShell from "../../components/PageShell";
import ArticleCard from "../../components/ArticleCard";
import { SORTED_ARTICLES } from "../../content/articles";
import { cn } from "../../lib/cn";

const CATEGORIES = ["All", ...new Set(SORTED_ARTICLES.map((a) => a.category))];

export default function ArticleIndex() {
  const [category, setCategory] = useState("All");
  const articles =
    category === "All"
      ? SORTED_ARTICLES
      : SORTED_ARTICLES.filter((a) => a.category === category);
  const [featured, ...rest] = articles;

  return (
    <PageShell
      title="Articles"
      subtitle="Guides, tips, and updates for keeping your Trooper safe."
      width="xl"
    >
      <div className="-mt-2 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by category">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={cn(
              "focus-ring rounded-full px-4 py-1.5 text-sm font-bold transition-colors cursor-pointer",
              category === c
                ? "bg-trooper-black text-cream"
                : "bg-cream-50 text-charcoal/70 ring-1 ring-line hover:text-trooper-black",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {featured && <ArticleCard article={featured} featured />}

      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
