import { useEffect, useState, type ReactNode, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";

import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import TextArea from "../../components/TextArea";
import FormField from "../../components/FormField";
import SegmentedControl from "../../components/SegmentedControl";
import StatusBadge from "../../components/StatusBadge";
import {
  ExternalLinkIcon,
  PawIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
} from "../../components/icons";
import {
  ApiError,
  adminListArticles,
  createCategory,
  deleteCategory,
  getStatistics,
  listCategories,
  updateCategory,
} from "../../api/content";
import { formatDate } from "../../content/articles";
import type { ArticleListItem, Category, Statistics } from "../../types/api";

type DashboardData = {
  stats: Statistics;
  articles: ArticleListItem[];
  categories: Category[];
};

function StatTile({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  note: string;
}) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-charcoal/65">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-trooper-tan/30 text-trooper-amber [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      </div>
      <p className="text-4xl font-bold tracking-tight text-trooper-black">
        {value.toLocaleString("en-US")}
      </p>
      <p className="text-xs font-semibold text-charcoal/45">{note}</p>
    </Card>
  );
}

type Filter = "all" | "published" | "draft";

function ArticlesPanel({ articles }: { articles: ArticleListItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const counts = {
    all: articles.length,
    published: articles.filter((a) => a.published).length,
    draft: articles.filter((a) => !a.published).length,
  };
  const q = query.trim().toLowerCase();
  const visible = articles.filter(
    (a) =>
      (filter === "all" || a.published === (filter === "published")) &&
      (!q || a.title.toLowerCase().includes(q) || a.category.name.toLowerCase().includes(q)),
  );

  return (
    <Card className="flex flex-col p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl text-trooper-black">Articles</h2>
          <p className="text-sm text-charcoal/60">Create, edit, and publish articles.</p>
        </div>
        <Button to="/admin/articles/new" size="sm" icon={<PlusIcon />} iconPosition="left">
          New article
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          label="Filter by status"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: counts.all },
            { value: "published", label: "Published", count: counts.published },
            { value: "draft", label: "Drafts", count: counts.draft },
          ]}
        />
        <TextInput
          placeholder="Search articles…"
          value={query}
          onChange={setQuery}
          className="sm:max-w-60"
        />
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line py-10 text-center text-sm text-charcoal/60">
          {q ? "No articles match your search." : "No articles here yet."}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {visible.map((a) => (
            <li key={a.id} className="flex items-center gap-4 py-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Link
                  to={`/admin/articles/${a.slug}`}
                  className="focus-ring truncate rounded-md font-bold text-trooper-black hover:text-trooper-amber"
                >
                  {a.title}
                </Link>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-charcoal/55">
                  <StatusBadge published={a.published} />
                  <span>{a.category.name}</span>
                  <span>{formatDate(a.date_published)}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {a.published && (
                  <Button
                    variant="ghost"
                    size="sm"
                    to={`/articles/${a.slug}`}
                    aria-label={`View ${a.title}`}
                    className="w-9 px-0 text-charcoal/60"
                  >
                    <ExternalLinkIcon width={16} height={16} />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  to={`/admin/articles/${a.slug}`}
                  icon={<PencilIcon />}
                  iconPosition="left"
                  className="text-trooper-black"
                >
                  Edit
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function errorMessage(err: unknown, duplicate: string) {
  if (err instanceof ApiError && err.issue === "duplicate") return duplicate;
  return err instanceof Error ? err.message : "Something went wrong.";
}

function CategoriesPanel({
  categories,
  articles,
  onChanged,
}: {
  categories: Category[];
  articles: ArticleListItem[];
  onChanged: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);

  const countFor = (id: number) => articles.filter((a) => a.category.id === id).length;
  const exists = (name: string, exceptId?: number) =>
    categories.some((c) => c.id !== exceptId && c.name.toLowerCase() === name.toLowerCase());

  async function handleAdd(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return setAddError("Enter a category name.");
    if (exists(name)) return setAddError("That category already exists.");
    setBusy(true);
    try {
      await createCategory({ name, description: newDescription.trim() });
      setNewName("");
      setNewDescription("");
      setAddError("");
      onChanged();
    } catch (err) {
      setAddError(errorMessage(err, "That category already exists."));
    } finally {
      setBusy(false);
    }
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDescription(c.description);
    setEditError("");
  }

  async function handleSaveEdit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editingId === null) return;
    const name = editName.trim();
    if (!name) return setEditError("Enter a name.");
    if (exists(name, editingId)) return setEditError("That category already exists.");
    setBusy(true);
    try {
      await updateCategory(editingId, { name, description: editDescription.trim() });
      setEditingId(null);
      onChanged();
    } catch (err) {
      setEditError(errorMessage(err, "That category already exists."));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(c: Category) {
    setRowErrors((prev) => ({ ...prev, [c.id]: "" }));
    setBusy(true);
    try {
      await deleteCategory(c.id);
      onChanged();
    } catch (err) {
      // Soft-deleted articles still reference their category, so the API can
      // refuse even when no visible article uses it.
      const message =
        err instanceof ApiError && err.issue === "in_use"
          ? "Still used by some articles (including deleted ones)."
          : errorMessage(err, "");
      setRowErrors((prev) => ({ ...prev, [c.id]: message }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-col p-6 sm:p-8">
      <h2 className="text-3xl text-trooper-black">Categories</h2>
      <p className="text-sm text-charcoal/60">Used to group and filter articles.</p>

      {categories.length === 0 && (
        <p className="mt-4 text-sm text-charcoal/60">No categories yet. Add one below.</p>
      )}

      <ul className="mt-4 divide-y divide-line">
        {categories.map((c) => {
          const count = countFor(c.id);
          return (
            <li key={c.id} className="py-3">
              {editingId === c.id ? (
                <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
                  <FormField label="Name" error={editError}>
                    <TextInput value={editName} onChange={setEditName} />
                  </FormField>
                  <FormField label="Description">
                    <TextArea rows={2} value={editDescription} onChange={setEditDescription} />
                  </FormField>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="text-trooper-black">
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={busy}>
                      Save
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-trooper-black">{c.name}</p>
                      {c.description ? (
                        <p className="line-clamp-2 text-sm text-charcoal/65">{c.description}</p>
                      ) : (
                        <p className="text-sm italic text-charcoal/40">No description</p>
                      )}
                      <p className="mt-0.5 text-xs text-charcoal/55">
                        {count} {count === 1 ? "article" : "articles"}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" aria-label={`Edit ${c.name}`} onClick={() => startEdit(c)} className="w-9 px-0 text-charcoal/60">
                      <PencilIcon width={16} height={16} />
                    </Button>
                    <span title={count ? "Move its articles to another category first" : undefined}>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${c.name}`}
                        disabled={count > 0 || busy}
                        onClick={() => handleDelete(c)}
                        className="w-9 px-0 text-danger hover:bg-danger/10"
                      >
                        <TrashIcon width={16} height={16} />
                      </Button>
                    </span>
                  </div>
                  {rowErrors[c.id] && <p className="mt-1 text-xs text-danger">{rowErrors[c.id]}</p>}
                </>
              )}
            </li>
          );
        })}
      </ul>

      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-3 border-t border-line pt-5">
        <p className="text-sm font-bold text-trooper-black">Add a category</p>
        <FormField label="Name" error={addError}>
          <TextInput
            placeholder="e.g. Health"
            value={newName}
            onChange={(v) => {
              setNewName(v);
              setAddError("");
            }}
          />
        </FormField>
        <FormField label="Description" hint="Optional. Shown when readers filter by this category.">
          <TextArea rows={2} value={newDescription} onChange={setNewDescription} />
        </FormField>
        <Button type="submit" variant="dark" className="self-end" disabled={busy}>
          Add category
        </Button>
      </form>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 rounded-2xl border border-line bg-cream-50" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-96 rounded-2xl border border-line bg-cream-50" />
        <div className="h-96 rounded-2xl border border-line bg-cream-50" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.all([getStatistics(), adminListArticles(), listCategories()])
      .then(([stats, articles, categories]) => {
        if (alive) setData({ stats, articles: articles ?? [], categories: categories ?? [] });
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  let content;
  if (failed) {
    content = (
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <p className="text-charcoal/70">We couldn't load the dashboard.</p>
        <Button
          variant="outline"
          className="text-trooper-black"
          onClick={() => {
            setFailed(false);
            reload();
          }}
        >
          Try again
        </Button>
      </Card>
    );
  } else if (!data) {
    content = <DashboardSkeleton />;
  } else {
    const published = data.articles.filter((a) => a.published).length;
    content = (
      <>
        <section aria-label="Site statistics" className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatTile icon={<UserIcon />} label="Accounts" value={data.stats.users} note="Registered users" />
          <StatTile icon={<PawIcon />} label="Pets" value={data.stats.pets} note="Across all accounts" />
          <StatTile
            icon={<PencilIcon />}
            label="Articles"
            value={data.stats.articles}
            note={`${published} published · ${data.articles.length - published} drafts`}
          />
        </section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ArticlesPanel articles={data.articles} />
          <CategoriesPanel categories={data.categories} articles={data.articles} onChanged={reload} />
        </div>
      </>
    );
  }

  return (
    <PageShell
      title="Admin dashboard"
      subtitle="Site overview and content management."
      width="xl"
      actions={
        <Button to="/admin/articles/new" icon={<PlusIcon />} iconPosition="left">
          New article
        </Button>
      }
    >
      {content}
    </PageShell>
  );
}
