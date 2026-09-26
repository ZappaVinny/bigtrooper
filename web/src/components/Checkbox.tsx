import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { CheckIcon } from "./icons";

export default function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer select-none items-start gap-3",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="grid h-5 w-5 place-items-center rounded-md border-[1.5px] border-trooper-black/30 bg-cream-50 text-cream transition-colors peer-checked:border-trooper-amber peer-checked:bg-trooper-amber peer-focus-visible:ring-2 peer-focus-visible:ring-trooper-amber/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-cream-50">
          {checked && <CheckIcon width={14} height={14} strokeWidth={3} />}
        </span>
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-charcoal">{label}</span>
        {description && <span className="text-xs text-charcoal/60">{description}</span>}
      </span>
    </label>
  );
}
