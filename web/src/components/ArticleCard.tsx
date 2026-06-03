import { cn } from "../lib/cn";

export default function ArticleCard({
  title,
  excerpt,
  date,
  category,
  featured = false,
  className,
}: {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  featured?: boolean;
  className?: string;
}) {
  if (featured) {
    return (
      <div
        className={cn(
          "flex rounded-2xl overflow-hidden border-2 border-trooper-black/10 bg-cream",
          className ?? "",
        )}
      >
        <div className="w-2 shrink-0 bg-trooper-amber rounded-l-2xl" />
        <div className="flex flex-col gap-3 p-8 flex-1">
          <div className="flex items-center gap-3">
            <span className="bg-trooper-amber text-cream text-xs font-bold not-fancy px-3 py-1 rounded-full uppercase tracking-wide">
              {category}
            </span>
            <span className="text-charcoal/50 text-sm not-fancy">{date}</span>
          </div>
          <h2 className="font-display text-3xl text-trooper-black leading-snug">
            {title}
          </h2>
          <p className="text-charcoal/80 text-base not-fancy leading-relaxed">
            {excerpt}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-6 rounded-2xl border-2 border-trooper-black/10 bg-cream",
        className ?? "",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="bg-trooper-tan text-trooper-black text-xs font-bold not-fancy px-2.5 py-0.5 rounded-full uppercase tracking-wide">
          {category}
        </span>
        <span className="text-charcoal/50 text-xs not-fancy">{date}</span>
      </div>
      <h3 className="font-display text-xl text-trooper-black leading-snug">
        {title}
      </h3>
      <p className="text-charcoal/70 text-sm not-fancy leading-relaxed line-clamp-3">
        {excerpt}
      </p>
    </div>
  );
}
