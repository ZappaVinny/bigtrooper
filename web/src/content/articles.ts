// Seed data and helpers for articles. Everything here is placeholder copy.
// The live list is held by ArticlesProvider (and edited from /admin); swap the
// seed for API data there. Each body is a list of blocks; the table of
// contents is generated from its "h2"/"h3" blocks.

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string };

export type ArticleStatus = "published" | "draft";

export type Article = {
  id: number;
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-05-12". */
  date: string;
  category: string;
  status: ArticleStatus;
  excerpt: string;
  body: ArticleBlock[];
};

export const SEED_CATEGORIES = ["Training", "Guides", "Safety", "Updates"];

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla condimentum nec nibh eget sodales. In pharetra velit at risus cursus, at interdum purus ornare. Quisque ipsum nibh, tincidunt tincidunt rutrum sit, consequat sed ligula. Maecenas ut neque eget felis semper suscipit. Vivamus commodo viverra risus sed semper. Donec vulputate at magna convallis auctor. Vestibulum at fringilla felis, quis malesuada lorem. Nunc at augue nisl. Pellentesque quis augue non risus eleifend ornare. Curabitur orci metus, mollis dapibus dui sed, sollicitudin viverra sem. Pellentesque eu elit varius, magna eleifend malesuada cursus a eros. Cras sit amet quam in diam rutrum placerat. Sed nibh mauris, dapibus sed tempor ac, malesuada sed risus. Integer quis leo nam sem iaculis scelerisque ut id lectus. In ut elit faucibus lorem blandit laoreet.";

const LOREM_SHORT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi fringilla sem id lacinia aliquam. Pellentesque volutpat mi vitae elit viverra, quis gravida neque placerat. In viverra placerat orci eget fringilla. Vivamus commodo nisl quis dolor mattis, at varius orci cursus. Maecenas sodales sem id nulla suscipit, at ultrices lacus varius. Cras eu ante suscipit, convallis nisl id, vehicula eros. Nullam pretium ornare dolor, in porta sem tempus sed. Aenean vel sapien arcu. Aenean justo lorem, cursus mollis volutpat vel, ultrices sit amet dui. Cras viverra varius mauris, id finibus tellus ultrices sit amet. Pellentesque felis orci, viverra ut convallis in, efficitur ac nulla. In et justo at velit blandit tristique vel eget magna. Etiam rhoncus nunc id tortor consequat quis pulvinar ante blandit. Morbi at lobortis lectus. Aliquam vel magna orci. Pellentesque ut dignissim nibh.";

// Placeholder body: an intro paragraph, then one section per heading.
function placeholderBody(headings: string[]): ArticleBlock[] {
  return [
    { type: "p", text: LOREM },
    ...headings.flatMap((text): ArticleBlock[] => [
      { type: "h2", text },
      { type: "p", text: LOREM_SHORT },
      { type: "p", text: LOREM_SHORT },
    ]),
  ];
}

export const SEED_ARTICLES: Article[] = [
  {
    id: 1,
    slug: "how-to-train-your-dog",
    title: "How to Train Your Dog",
    date: "2026-05-17",
    category: "Training",
    status: "published",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla condimentum nec nibh eget sodales, in pharetra velit at risus cursus.",
    body: placeholderBody([
      "Start with the basics",
      "Keep sessions short",
      "Reward the right moments",
      "Practice recall",
      "Be patient",
    ]),
  },
  {
    id: 2,
    slug: "printing-your-first-tag",
    title: "Printing Your First Tag",
    date: "2026-05-12",
    category: "Guides",
    status: "published",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi fringilla sem id lacinia aliquam, pellentesque volutpat mi vitae elit.",
    body: placeholderBody([
      "Download your model",
      "Printing at home",
      "Using an online print service",
      "Attaching the tag",
    ]),
  },
  {
    id: 3,
    slug: "if-your-pet-goes-missing",
    title: "If Your Pet Goes Missing",
    date: "2026-05-08",
    category: "Safety",
    status: "draft",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ipsum nibh, tincidunt tincidunt rutrum sit, consequat sed ligula.",
    body: placeholderBody([
      "The first hour",
      "Check your notifications",
      "Search the neighborhood",
      "Bringing them home",
    ]),
  },
  {
    id: 4,
    slug: "welcome-to-bigtrooper",
    title: "Welcome to BigTrooper",
    date: "2026-05-01",
    category: "Updates",
    status: "published",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ut neque eget felis semper suscipit, vivamus commodo viverra risus.",
    body: placeholderBody(["Why we built it", "What's next"]),
  },
];

/** Newest first. */
export function sortNewest(articles: Article[]) {
  return [...articles].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Plain-text editing format used by the admin editor until a WYSIWYG editor
 * lands: blank lines separate blocks, "## " starts a section heading and
 * "### " a sub-heading.
 */
export function bodyToText(body: ArticleBlock[]) {
  return body
    .map((b) => (b.type === "h2" ? `## ${b.text}` : b.type === "h3" ? `### ${b.text}` : b.text))
    .join("\n\n");
}

export function textToBody(text: string): ArticleBlock[] {
  return text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk): ArticleBlock => {
      if (chunk.startsWith("### ")) return { type: "h3", text: chunk.slice(4).trim() };
      if (chunk.startsWith("## ")) return { type: "h2", text: chunk.slice(3).trim() };
      return { type: "p", text: chunk.replace(/\s*\n\s*/g, " ") };
    });
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDate(iso: string) {
  // Parse as a local date so "2026-05-12" never shifts a day by time zone.
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function readingMinutes(article: Pick<Article, "body">) {
  const words = article.body.reduce((n, b) => n + b.text.split(/\s+/).length, 0);
  return Math.max(1, Math.round(words / 220));
}

export type Heading = { id: string; text: string; level: 2 | 3 };

/** The article's h2/h3 headings with unique, URL-safe ids. */
export function getHeadings(body: ArticleBlock[]): Heading[] {
  const seen = new Map<string, number>();
  return body
    .filter((b) => b.type === "h2" || b.type === "h3")
    .map((b) => {
      const base = slugify(b.text) || "section";
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return {
        id: count ? `${base}-${count + 1}` : base,
        text: b.text,
        level: b.type === "h2" ? 2 : 3,
      };
    });
}
