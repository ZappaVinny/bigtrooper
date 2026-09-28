import { useEffect, useState, type SyntheticEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import FormField from "../../components/FormField";
import FormMessage from "../../components/FormMessage";
import TextInput from "../../components/TextInput";
import TextArea from "../../components/TextArea";
import SelectInput from "../../components/SelectInput";
import SegmentedControl from "../../components/SegmentedControl";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import ModalHeader from "../../components/ModalHeader";
import ModalBody from "../../components/ModalBody";
import ModalFooter from "../../components/ModalFooter";
import { ArrowLeftIcon, ExternalLinkIcon, TrashIcon } from "../../components/icons";
import {
  ApiError,
  adminGetArticle,
  createArticle,
  deleteArticle,
  listCategories,
  updateArticle,
} from "../../api/content";
import { getHeadings, readingMinutes, textToBody } from "../../content/articles";
import type { Article, ArticleInput, Category } from "../../types/api";

type Errors = Partial<Record<"title" | "category" | "excerpt" | "body" | "date", string>>;
type Status = "draft" | "published";

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function Editor({
  article,
  categories,
  onSaved,
}: {
  article: Article | null;
  categories: Category[];
  onSaved: (article: Article) => void;
}) {
  const navigate = useNavigate();
  const justSaved = Boolean((useLocation().state as { saved?: boolean } | null)?.saved);

  const [title, setTitle] = useState(article?.title ?? "");
  const [categoryId, setCategoryId] = useState(article ? String(article.category.id) : "");
  const [status, setStatus] = useState<Status>(article?.published ? "published" : "draft");
  const [date, setDate] = useState(article?.date_published ?? today());
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [bodyText, setBodyText] = useState(article?.body ?? "");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(justSaved);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const headings = getHeadings(textToBody(bodyText));
  const words = bodyText.trim() ? bodyText.trim().split(/\s+/).length : 0;
  const isNew = !article;

  function edited<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setSaved(false);
    };
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!title.trim()) next.title = "Add a title.";
    if (!categoryId) next.category = "Choose a category.";
    if (!date) next.date = "Pick a date.";
    if (!excerpt.trim()) next.excerpt = "Add a short summary for article cards.";
    if (!bodyText.trim()) next.body = "Write the article body.";
    return next;
  }

  async function handleSave(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    setSaved(false);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const input: ArticleInput = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      body: bodyText.trim(),
      category_id: Number(categoryId),
      published: status === "published",
      date_published: date,
    };

    setSaving(true);
    try {
      const result = article ? await updateArticle(article.slug, input) : await createArticle(input);
      if (!article || result.slug !== article.slug) {
        // New article, or the title changed and the server gave it a new slug.
        navigate(`/admin/articles/${result.slug}`, { replace: true, state: { saved: true } });
      } else {
        onSaved(result);
        setSaved(true);
      }
    } catch (err) {
      if (err instanceof ApiError && err.issue === "duplicate") {
        setErrors({ title: "An article with this title already exists." });
      } else if (err instanceof ApiError && err.issue === "not_found") {
        setErrors({ category: "Choose a category." });
      } else {
        setFormError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!article) return;
    setDeleting(true);
    try {
      await deleteArticle(article.slug);
      navigate("/admin", { replace: true });
    } catch (err) {
      setConfirmDelete(false);
      setFormError(err instanceof Error ? err.message : "Couldn't delete the article.");
    } finally {
      setDeleting(false);
    }
  }

  const saveLabel = saving
    ? "Saving…"
    : status === "draft"
      ? "Save draft"
      : isNew || !article?.published
        ? "Publish"
        : "Update article";

  return (
    <PageShell
      title={isNew ? "New article" : "Edit article"}
      subtitle={isNew ? "Write it, save it as a draft, and publish when it's ready." : title || "Untitled"}
      eyebrow={
        <Link
          to="/admin"
          className="focus-ring inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-bold text-charcoal/60 hover:text-trooper-amber"
        >
          <ArrowLeftIcon width={16} height={16} /> Admin dashboard
        </Link>
      }
      actions={article && <StatusBadge published={article.published} />}
      width="xl"
    >
      <form
        onSubmit={handleSave}
        noValidate
        className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        {/* Main: content */}
        <Card className="flex flex-col gap-5 p-6 sm:p-8">
          <FormField label="Title" error={errors.title}>
            <TextInput placeholder="How to Train Your Dog" value={title} onChange={edited(setTitle)} />
          </FormField>
          {article && (
            <p className="-mt-3 text-xs text-charcoal/55">
              Web address: bigtrooper.com/articles/{article.slug}
            </p>
          )}

          <FormField
            label="Summary"
            hint="Shown on article cards and the articles index."
            error={errors.excerpt}
          >
            <TextArea rows={3} value={excerpt} onChange={edited(setExcerpt)} />
          </FormField>

          {/* Plain text for now; a WYSIWYG editor will replace this TextArea. */}
          <FormField
            label="Body"
            hint='Separate paragraphs with a blank line. Start a line with "## " for a section heading or "### " for a sub-heading. Headings build the table of contents.'
            error={errors.body}
          >
            <TextArea
              rows={20}
              placeholder={"Your opening paragraph…\n\n## First section\n\nSection text…"}
              value={bodyText}
              onChange={edited(setBodyText)}
            />
          </FormField>
          <p className="-mt-2 text-xs font-semibold text-charcoal/50">
            {words.toLocaleString("en-US")} words · {words ? readingMinutes(bodyText) : 0} min read
          </p>
        </Card>

        {/* Side: publishing */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <Card className="flex flex-col gap-5 p-6">
            <h2 className="text-2xl text-trooper-black">Publishing</h2>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-charcoal">Status</span>
              <SegmentedControl
                label="Status"
                value={status}
                onChange={edited(setStatus)}
                className="w-full"
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                ]}
              />
              <p className="text-xs text-charcoal/60">
                {status === "draft"
                  ? "Only visible here in the dashboard."
                  : "Visible to everyone on the Articles page."}
              </p>
            </div>

            <FormField
              label="Category"
              error={errors.category}
              hint={categories.length === 0 ? "Add a category on the dashboard first." : undefined}
            >
              <SelectInput
                placeholder="Choose"
                options={categories.map((c) => ({
                  label: c.name,
                  value: String(c.id),
                  description: c.description,
                }))}
                value={categoryId}
                onChange={edited(setCategoryId)}
                open={categoryOpen}
                onOpenChange={setCategoryOpen}
              />
            </FormField>

            <FormField label="Publish date" error={errors.date}>
              <TextInput inputType="date" value={date} onChange={edited(setDate)} />
            </FormField>

            {saved && <FormMessage tone="success">Saved.</FormMessage>}
            {formError && <FormMessage>{formError}</FormMessage>}
            {Object.keys(errors).length > 0 && (
              <FormMessage>Fix the highlighted fields to save.</FormMessage>
            )}

            <div className="flex flex-col gap-2 border-t border-line pt-5">
              <Button type="submit" fullWidth disabled={saving}>
                {saveLabel}
              </Button>
              {article?.published && (
                <Button
                  variant="outline"
                  to={`/articles/${article.slug}`}
                  fullWidth
                  icon={<ExternalLinkIcon />}
                  className="text-trooper-black"
                >
                  View live article
                </Button>
              )}
              {article && (
                <Button
                  variant="ghost"
                  fullWidth
                  icon={<TrashIcon />}
                  iconPosition="left"
                  onClick={() => setConfirmDelete(true)}
                  className="text-danger hover:bg-danger/10"
                >
                  Delete article
                </Button>
              )}
            </div>
          </Card>

          <Card className="flex flex-col gap-3 p-6">
            <h2 className="text-2xl text-trooper-black">Table of contents</h2>
            {headings.length ? (
              <ol className="flex flex-col gap-1.5 text-sm">
                {headings.map((h) => (
                  <li
                    key={h.id}
                    className={h.level === 3 ? "pl-4 text-charcoal/60" : "font-semibold text-charcoal"}
                  >
                    {h.text}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-charcoal/60">
                Add "## " headings to the body and they'll appear here.
              </p>
            )}
          </Card>
        </div>
      </form>

      {confirmDelete && article && (
        <Modal onClose={() => setConfirmDelete(false)} labelledBy="delete-article-title">
          <ModalHeader id="delete-article-title" onClose={() => setConfirmDelete(false)}>
            Delete this article?
          </ModalHeader>
          <ModalBody>
            <p className="text-charcoal/80">
              "{article.title}" will be removed from the site. This can't be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)} className="text-trooper-black">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete article"}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </PageShell>
  );
}

function EditorLoader({ slug }: { slug?: string }) {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [failure, setFailure] = useState<"not-found" | "error" | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([listCategories(), slug ? adminGetArticle(slug) : Promise.resolve(null)])
      .then(([cats, art]) => {
        if (!alive) return;
        setArticle(art);
        setCategories(cats ?? []);
      })
      .catch((err) => {
        if (alive) setFailure(err instanceof ApiError && err.status === 404 ? "not-found" : "error");
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (failure) {
    return (
      <PageShell title={failure === "not-found" ? "Article not found" : "Something went wrong"} width="sm" center>
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-charcoal/70">
            {failure === "not-found"
              ? "This article doesn't exist or was deleted."
              : "We couldn't load the editor. Please try again."}
          </p>
          <Button to="/admin">Back to dashboard</Button>
        </Card>
      </PageShell>
    );
  }

  if (!categories) {
    return (
      <PageShell width="xl">
        <div className="grid animate-pulse grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-144 rounded-2xl border border-line bg-cream-50" />
          <div className="h-80 rounded-2xl border border-line bg-cream-50" />
        </div>
      </PageShell>
    );
  }

  return <Editor article={article} categories={categories} onSaved={setArticle} />;
}

export default function ArticleEditor() {
  const { slug } = useParams<{ slug: string }>();
  // Keyed so creating an article or renaming it (new slug) loads fresh.
  return <EditorLoader key={slug ?? "new"} slug={slug} />;
}
