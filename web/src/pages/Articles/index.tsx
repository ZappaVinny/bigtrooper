import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import ArticleCard from "../../components/ArticleCard";
import { listArticles } from "../../api/content";
import type { ArticleListItem } from "../../types/api";
import { cn } from "../../lib/cn";

function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl border border-line",
        featured ? "h-64 bg-trooper-black/10" : "h-56 bg-cream-50",
      )}
    />
  );
}

export default function ArticleIndex() {
  const [published, setPublished] = useState<ArticleListItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    listArticles()
      .then((data) => alive && setPublished(data ?? []))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  // Only categories that have published articles, each listed once.
  const categories = [...new Map((published ?? []).map((a) => [a.category.id, a.category])).values()];
  const selected = categories.find((c) => c.id === categoryId);
  const articles = selected
    ? (published ?? []).filter((a) => a.category.id === selected.id)
    : (published ?? []);
  const [featured, ...rest] = articles;

  let content;
  if (failed) {
    content = (
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <p className="text-charcoal/70">We couldn't load articles right now.</p>
        <Button
          variant="outline"
          className="text-trooper-black"
          onClick={() => {
            setFailed(false);
            setReloadKey((k) => k + 1);
          }}
        >
          Try again
        </Button>
      </Card>
    );
  } else if (!published) {
    content = (
      <>
        <SkeletonCard featured />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </>
    );
  } else if (published.length === 0) {
    content = (
      <Card className="p-10 text-center text-charcoal/70">
        No articles yet. Check back soon.
      </Card>
    );
  } else {
    content = (
      <>
        <div className="-mt-2 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by category">
          {[{ id: null, name: "All" }, ...categories].map((c) => (
            <button
              key={c.id ?? "all"}
              type="button"
              onClick={() => setCategoryId(c.id)}
              aria-pressed={categoryId === c.id}
              className={cn(
                "focus-ring rounded-full px-4 py-1.5 text-sm font-bold transition-colors cursor-pointer",
                categoryId === c.id
                  ? "bg-trooper-black text-cream"
                  : "bg-cream-50 text-charcoal/70 ring-1 ring-line hover:text-trooper-black",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
        {selected?.description && (
          <p className="-mt-4 text-center text-sm text-charcoal/65">{selected.description}</p>
        )}

        {featured && <ArticleCard article={featured} featured />}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <PageShell
      title="Articles"
      subtitle="Guides, tips, and updates for keeping your Trooper safe."
      width="xl"
    >
      {content}
    </PageShell>
  );
}
