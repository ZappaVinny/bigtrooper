import { useState, type SyntheticEvent } from "react";
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
import { useArticles } from "../../content/ArticlesContext";
import {
  bodyToText,
  getHeadings,
  readingMinutes,
  slugify,
  textToBody,
  type Article,
  type ArticleStatus,
} from "../../content/articles";

type Errors = Partial<Record<"title" | "slug" | "category" | "excerpt" | "body" | "date", string>>;

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function Editor({ article }: { article?: Article }) {
  const { articles, categories, saveArticle, deleteArticle } = useArticles();
  const navigate = useNavigate();
  const justCreated = Boolean((useLocation().state as { created?: boolean } | null)?.created);

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  // New articles derive the slug from the title until it's edited by hand.
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [category, setCategory] = useState(article?.category ?? "");
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? "draft");
  const [date, setDate] = useState(article?.date ?? today());
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [bodyText, setBodyText] = useState(article ? bodyToText(article.body) : "");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(justCreated);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const body = textToBody(bodyText);
  const headings = getHeadings(body);
  const words = bodyText.trim() ? bodyText.trim().split(/\s+/).length : 0;
  const isNew = !article;

  function edited<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setSaved(false);
    };
  }

  function handleTitle(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
    setSaved(false);
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!title.trim()) next.title = "Add a title.";
    if (!slug) next.slug = "Add a URL slug.";
    else if (slug !== slugify(slug)) next.slug = "Use lowercase letters, numbers, and dashes only.";
    else if (articles.some((a) => a.slug === slug && a.id !== article?.id))
      next.slug = "Another article already uses this URL.";
    if (!category) next.category = "Choose a category.";
    if (!date) next.date = "Pick a date.";
    if (!excerpt.trim()) next.excerpt = "Add a short summary for article cards.";
    if (body.length === 0) next.body = "Write the article body.";
    return next;
  }

  function handleSave(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    setSaved(false);
    if (Object.keys(next).length > 0) return;

    const result = saveArticle({
      id: article?.id,
      title: title.trim(),
      slug,
      category,
      status,
      date,
      excerpt: excerpt.trim(),
      body,
    });
    if (isNew) {
      navigate(`/admin/articles/${result.id}`, { replace: true, state: { created: true } });
    } else {
      setSaved(true);
    }
  }

  const saveLabel =
    status === "draft"
      ? "Save draft"
      : isNew || article?.status === "draft"
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
      actions={article && <StatusBadge status={article.status} />}
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
            <TextInput placeholder="How to Train Your Dog" value={title} onChange={handleTitle} />
          </FormField>

          <FormField
            label="URL slug"
            hint={slug ? `bigtrooper.com/articles/${slug}` : "Generated from the title."}
            error={errors.slug}
          >
            <TextInput
              placeholder="how-to-train-your-dog"
              value={slug}
              onChange={(v) => {
                setSlugTouched(true);
                edited(setSlug)(v.toLowerCase().replace(/\s+/g, "-"));
              }}
            />
          </FormField>

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
            {words.toLocaleString("en-US")} words ·{" "}
            {words ? readingMinutes({ body }) : 0} min read
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

            <FormField label="Category" error={errors.category}>
              <SelectInput
                placeholder="Choose"
                options={categories.map((c) => ({ label: c, value: c }))}
                value={category}
                onChange={edited(setCategory)}
                open={categoryOpen}
                onOpenChange={setCategoryOpen}
              />
            </FormField>

            <FormField label="Publish date" error={errors.date}>
              <TextInput inputType="date" value={date} onChange={edited(setDate)} />
            </FormField>

            {saved && <FormMessage tone="success">Saved.</FormMessage>}
            {Object.keys(errors).length > 0 && (
              <FormMessage>Fix the highlighted fields to save.</FormMessage>
            )}

            <div className="flex flex-col gap-2 border-t border-line pt-5">
              <Button type="submit" fullWidth>
                {saveLabel}
              </Button>
              {article?.status === "published" && (
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
            <Button
              variant="danger"
              onClick={() => {
                deleteArticle(article.id);
                navigate("/admin", { replace: true });
              }}
            >
              Delete article
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </PageShell>
  );
}

export default function ArticleEditor() {
  const { id } = useParams<{ id: string }>();
  const { articles } = useArticles();

  if (!id) return <Editor key="new" />;

  const article = articles.find((a) => a.id === Number(id));
  if (!article) {
    return (
      <PageShell title="Article not found" width="sm" center>
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-charcoal/70">This article doesn't exist or was deleted.</p>
          <Button to="/admin">Back to dashboard</Button>
        </Card>
      </PageShell>
    );
  }
  // Keyed by id so switching articles resets the form.
  return <Editor key={article.id} article={article} />;
}
