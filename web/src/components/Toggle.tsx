import { cn } from "../lib/cn";

export default function Toggle({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex flex-col items-center gap-0.5 cursor-pointer select-none",
        className,
      )}
    >
      {label && (
        <span className="text-xs text-trooper-black font-sans font-semibold">{label}</span>
      )}
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 rounded-full bg-charcoal peer-checked:bg-trooper-amber transition-colors duration-200" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
      </div>
    </label>
  );
}
