import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import ArticleCard from "../../components/ArticleCard";
import TableOfContents from "../../components/TableOfContents";
import { ArrowLeftIcon } from "../../components/icons";
import { formatDate, getHeadings, readingMinutes, textToBody } from "../../content/articles";
import { ApiError, getArticle, listArticles } from "../../api/content";
import type { Article, ArticleListItem } from "../../types/api";

export default function ArticlePage() {
  const { slug = "" } = useParams<{ slug: string }>();
  // Keyed so moving to another article starts from a clean loading state.
  return <ArticleView key={slug} slug={slug} />;
}

function ArticleView({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [others, setOthers] = useState<ArticleListItem[]>([]);
  const [failure, setFailure] = useState<"not-found" | "error" | null>(null);

  useEffect(() => {
    let alive = true;
    getArticle(slug)
      .then((a) => alive && setArticle(a))
      .catch((err) => {
        if (alive) setFailure(err instanceof ApiError && err.status === 404 ? "not-found" : "error");
      });
    listArticles()
      .then((list) => alive && setOthers(list ?? []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [slug]);

  if (failure === "error") {
    return (
      <PageShell title="Something went wrong" width="sm" center>
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-charcoal/70">We couldn't load this article. Please try again.</p>
          <Button to="/articles">Browse all articles</Button>
        </Card>
      </PageShell>
    );
  }

  if (failure === "not-found") {
    return (
      <PageShell title="Article not found" width="sm" center>
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-charcoal/70">
            We couldn't find that article. It may have moved.
          </p>
          <Button to="/articles">Browse all articles</Button>
        </Card>
      </PageShell>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-10 md:px-8 md:py-14">
        <div className="flex max-w-3xl flex-col gap-4 lg:ml-[264px]">
          <div className="h-4 w-24 rounded-full bg-trooper-black/10" />
          <div className="h-12 w-3/4 rounded-full bg-trooper-black/10" />
          <div className="mt-4 h-72 rounded-2xl border border-line bg-cream-50" />
        </div>
      </div>
    );
  }

  const blocks = textToBody(article.body);
  const headings = getHeadings(blocks);
  let headingIndex = 0;
  const more = others.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-14">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-x-16">
        <header className="flex max-w-3xl flex-col gap-4 lg:col-start-2">
          <Link
            to="/articles"
            className="focus-ring inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-bold text-charcoal/60 hover:text-trooper-amber"
          >
            <ArrowLeftIcon width={16} height={16} /> All articles
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold">
            <span className="rounded-full bg-trooper-tan/35 px-2.5 py-1 uppercase tracking-[0.12em] text-trooper-amber">
              {article.category.name}
            </span>
            <span className="text-charcoal/50">
              {formatDate(article.date_published)} · {readingMinutes(article.body)} min read
            </span>
          </div>
          <h1 className="text-4xl leading-tight text-trooper-black md:text-6xl">
            {article.title}
          </h1>
        </header>

        {/* Built from the body's headings; sticks beside the article on desktop. */}
        <TableOfContents
          key={article.slug}
          headings={headings}
          className="lg:col-start-1 lg:row-span-2 lg:row-start-1"
        />

        <article className="flex max-w-3xl flex-col gap-5 lg:col-start-2">
          {blocks.map((block, i) => {
            if (block.type === "p") {
              return (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "text-lg leading-relaxed text-charcoal md:text-xl"
                      : "leading-relaxed text-charcoal/85 md:text-[17px]"
                  }
                >
                  {block.text}
                </p>
              );
            }
            const { id } = headings[headingIndex++];
            const Tag = block.type;
            return (
              <Tag
                key={i}
                id={id}
                className={
                  block.type === "h2"
                    ? "mt-6 scroll-mt-[calc(var(--header-h)+1.5rem)] text-3xl text-trooper-black"
                    : "mt-2 scroll-mt-[calc(var(--header-h)+1.5rem)] text-2xl text-trooper-black"
                }
              >
                {block.text}
              </Tag>
            );
          })}
        </article>
      </div>

      {more.length > 0 && (
        <section className="mt-20 border-t border-line pt-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-3xl text-trooper-black">More articles</h2>
            <Link to="/articles" className="link text-sm">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {more.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
