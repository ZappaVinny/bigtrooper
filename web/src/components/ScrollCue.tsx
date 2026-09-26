import { cn } from "../lib/cn";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";

// "Next section" prompt at the bottom of each homepage panel.
export default function ScrollCue({
  label,
  target,
  direction = "down",
  tone = "dark",
}: {
  label: string;
  target: string;
  direction?: "down" | "up";
  tone?: "dark" | "light";
}) {
  const Chevron = direction === "down" ? ChevronDownIcon : ChevronUpIcon;

  return (
    <button
      type="button"
      onClick={() =>
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth" })
      }
      aria-label={`Scroll to ${label}`}
      className={cn(
        "focus-ring absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-0.5 rounded-full px-4 py-1.5 cursor-pointer",
        "text-[11px] font-extrabold uppercase tracking-[0.18em] opacity-60 transition-opacity hover:opacity-100",
        tone === "dark" ? "text-trooper-black" : "text-cream",
        direction === "up" && "flex-col-reverse",
      )}
    >
      {label}
      <Chevron
        width={26}
        height={26}
        className={cn(direction === "down" && "animate-nudge")}
      />
    </button>
  );
}
