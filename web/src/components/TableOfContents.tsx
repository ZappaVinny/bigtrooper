import { useEffect, useState } from "react";
import type { Heading } from "../content/articles";
import { cn } from "../lib/cn";
import { ChevronDownIcon } from "./icons";

// Highlights the last heading that has scrolled past the sticky header.
function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    function update() {
      const offset =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) * 16 + 32;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) current = id;
      }
      // At the very bottom, the last section may never reach the top.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = ids[ids.length - 1];
      }
      setActive(current);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ids]);

  return active;
}

function TocList({ headings, active }: { headings: Heading[]; active?: string }) {
  return (
    <ul className="flex flex-col border-l border-line">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            className={cn(
              "-ml-px block border-l-2 py-1.5 pr-2 text-sm leading-snug transition-colors",
              h.level === 3 ? "pl-7" : "pl-4",
              active === h.id
                ? "border-trooper-amber font-bold text-trooper-black"
                : "border-transparent font-semibold text-charcoal/60 hover:border-trooper-black/20 hover:text-trooper-black",
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function TableOfContents({
  headings,
  className,
}: {
  headings: Heading[];
  className?: string;
}) {
  const [ids] = useState(() => headings.map((h) => h.id));
  const active = useActiveHeading(ids);

  if (headings.length === 0) return null;

  return (
    <div className={className}>
      {/* Desktop: sticky sidebar */}
      <nav
        aria-label="Table of contents"
        className="hidden lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:block"
      >
        <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.15em] text-charcoal/50">
          On this page
        </p>
        <TocList headings={headings} active={active} />
      </nav>

      {/* Mobile: collapsible panel above the article */}
      <details className="group rounded-2xl border border-line bg-cream-50 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-trooper-black [&::-webkit-details-marker]:hidden">
          On this page
          <ChevronDownIcon
            width={18}
            height={18}
            className="text-charcoal/50 transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="px-4 pb-4">
          <TocList headings={headings} active={active} />
        </div>
      </details>
    </div>
  );
}
