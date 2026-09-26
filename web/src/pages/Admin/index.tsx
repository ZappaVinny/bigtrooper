import { useState, type ReactNode, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";

import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import SegmentedControl from "../../components/SegmentedControl";
import StatusBadge from "../../components/StatusBadge";
import {
  CheckIcon,
  CloseIcon,
  ExternalLinkIcon,
  PawIcon,
  PencilIcon,
  PlusIcon,
  QrIcon,
  TrashIcon,
  UserIcon,
} from "../../components/icons";
import { useArticles } from "../../content/ArticlesContext";
import { formatDate, sortNewest, type ArticleStatus } from "../../content/articles";

// PLACEHOLDER STATS: replace with a real request (e.g. GET /api/admin/stats
// returning { accounts, pets, scans }) once the backend exposes it.
const PLACEHOLDER_STATS = { accounts: 1284, pets: 2047, scans: 5392 };

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

type Filter = "all" | ArticleStatus;

function ArticlesPanel() {
  const { articles } = useArticles();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const counts = {
    all: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    draft: articles.filter((a) => a.status === "draft").length,
  };
  const q = query.trim().toLowerCase();
  const visible = sortNewest(articles).filter(
    (a) =>
      (filter === "all" || a.status === filter) &&
      (!q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)),
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
                  to={`/admin/articles/${a.id}`}
                  className="focus-ring truncate rounded-md font-bold text-trooper-black hover:text-trooper-amber"
                >
                  {a.title}
                </Link>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-charcoal/55">
                  <StatusBadge status={a.status} />
                  <span>{a.category}</span>
                  <span>{formatDate(a.date)}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {a.status === "published" && (
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
                  to={`/admin/articles/${a.id}`}
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

function CategoriesPanel() {
  const { articles, categories, addCategory, renameCategory, deleteCategory } = useArticles();
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");

  const countFor = (c: string) => articles.filter((a) => a.category === c).length;
  const exists = (name: string, except?: string) =>
    categories.some((c) => c !== except && c.toLowerCase() === name.toLowerCase());

  function handleAdd(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return setAddError("Enter a category name.");
    if (exists(name)) return setAddError("That category already exists.");
    addCategory(name);
    setNewName("");
    setAddError("");
  }

  function startEdit(c: string) {
    setEditing(c);
    setEditName(c);
    setEditError("");
  }

  function handleRename(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const name = editName.trim();
    if (!name) return setEditError("Enter a name.");
    if (exists(name, editing)) return setEditError("That category already exists.");
    renameCategory(editing, name);
    setEditing(null);
  }

  return (
    <Card className="flex flex-col p-6 sm:p-8">
      <h2 className="text-3xl text-trooper-black">Categories</h2>
      <p className="text-sm text-charcoal/60">Used to group and filter articles.</p>

      <ul className="mt-4 divide-y divide-line">
        {categories.map((c) => {
          const count = countFor(c);
          return (
            <li key={c} className="py-3">
              {editing === c ? (
                <form onSubmit={handleRename} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <TextInput value={editName} onChange={setEditName} aria-invalid={!!editError} />
                    <Button type="submit" variant="ghost" size="sm" aria-label="Save name" className="w-9 shrink-0 px-0 text-success">
                      <CheckIcon width={18} height={18} />
                    </Button>
                    <Button variant="ghost" size="sm" aria-label="Cancel" onClick={() => setEditing(null)} className="w-9 shrink-0 px-0 text-charcoal/60">
                      <CloseIcon width={18} height={18} />
                    </Button>
                  </div>
                  {editError && <p className="text-xs text-danger">{editError}</p>}
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-trooper-black">{c}</p>
                    <p className="text-xs text-charcoal/55">
                      {count} {count === 1 ? "article" : "articles"}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" aria-label={`Rename ${c}`} onClick={() => startEdit(c)} className="w-9 px-0 text-charcoal/60">
                    <PencilIcon width={16} height={16} />
                  </Button>
                  <span title={count ? "Move its articles to another category first" : undefined}>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Delete ${c}`}
                      disabled={count > 0}
                      onClick={() => deleteCategory(c)}
                      className="w-9 px-0 text-danger hover:bg-danger/10"
                    >
                      <TrashIcon width={16} height={16} />
                    </Button>
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-1.5 border-t border-line pt-5">
        <label htmlFor="new-category" className="text-sm font-semibold text-charcoal">
          Add a category
        </label>
        <div className="flex gap-2">
          <TextInput
            id="new-category"
            placeholder="e.g. Health"
            value={newName}
            onChange={(v) => {
              setNewName(v);
              setAddError("");
            }}
            aria-invalid={!!addError}
          />
          <Button type="submit" variant="dark" className="shrink-0">
            Add
          </Button>
        </div>
        {addError && <p className="text-xs text-danger">{addError}</p>}
      </form>
    </Card>
  );
}

export default function AdminDashboard() {
  const { articles } = useArticles();
  const published = articles.filter((a) => a.status === "published").length;

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
      <section aria-label="Site statistics" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={<UserIcon />} label="Accounts" value={PLACEHOLDER_STATS.accounts} note="Sample data" />
        <StatTile icon={<PawIcon />} label="Pets" value={PLACEHOLDER_STATS.pets} note="Sample data" />
        <StatTile icon={<QrIcon />} label="Tag scans" value={PLACEHOLDER_STATS.scans} note="Sample data" />
        <StatTile
          icon={<PencilIcon />}
          label="Published articles"
          value={published}
          note={`${articles.length - published} in draft`}
        />
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ArticlesPanel />
        <CategoriesPanel />
      </div>
    </PageShell>
  );
}
