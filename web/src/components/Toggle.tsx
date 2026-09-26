import { cn } from "../lib/cn";

export default function Toggle({
  checked,
  onChange,
  label,
  description,
  labelPosition = "top",
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  labelPosition?: "top" | "side";
  className?: string;
}) {
  const side = labelPosition === "side";

  return (
    <label
      className={cn(
        "flex cursor-pointer select-none",
        side
          ? "w-full flex-row items-center justify-between gap-4"
          : "flex-col items-center gap-1",
        className,
      )}
    >
      {label && (
        <span className="flex flex-col">
          <span
            className={cn(
              "font-semibold text-charcoal",
              side ? "text-sm" : "text-xs",
            )}
          >
            {label}
          </span>
          {description && (
            <span className="text-xs text-charcoal/60">{description}</span>
          )}
        </span>
      )}
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="h-6 w-11 rounded-full bg-trooper-black/20 transition-colors duration-200 peer-checked:bg-trooper-amber peer-focus-visible:ring-2 peer-focus-visible:ring-trooper-amber/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-cream" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-cream-50 shadow-sm transition-transform duration-200 peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
