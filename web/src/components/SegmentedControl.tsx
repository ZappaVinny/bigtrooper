import { cn } from "../lib/cn";

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex rounded-full bg-trooper-black/5 p-1", className)}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={cn(
              "focus-ring flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors cursor-pointer",
              selected
                ? "bg-cream-50 text-trooper-black shadow-sm"
                : "text-charcoal/60 hover:text-trooper-black",
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={cn("text-xs", selected ? "text-charcoal/60" : "text-charcoal/40")}>
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
