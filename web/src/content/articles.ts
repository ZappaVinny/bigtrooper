// Helpers for rendering article bodies. Bodies are stored as plain text (the
// admin editor's format until a WYSIWYG editor lands): blank lines separate
// blocks, "## " starts a section heading and "### " a sub-heading.

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string };

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

export function formatDate(iso: string) {
  // Parse as a local date so "2026-05-12" never shifts a day by time zone.
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function readingMinutes(bodyText: string) {
  const words = bodyText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export type Heading = { id: string; text: string; level: 2 | 3 };

// Anchor ids for the table of contents ("Start with the basics" ->
// "start-with-the-basics"). Browser-only; unrelated to article slugs, which
// the server generates.
function headingAnchor(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getHeadings(body: ArticleBlock[]): Heading[] {
  const seen = new Map<string, number>();
  return body
    .filter((b) => b.type === "h2" || b.type === "h3")
    .map((b) => {
      const base = headingAnchor(b.text) || "section";
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return {
        id: count ? `${base}-${count + 1}` : base,
        text: b.text,
        level: b.type === "h2" ? 2 : 3,
      };
    });
}
