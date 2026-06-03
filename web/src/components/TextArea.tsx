import { cn } from "../lib/cn";
import BoneIcon from "../assets/bone.svg";

export default function TextArea({
  className,
  placeholder = "",
  value,
  onChange,
  rows = 4,
}: {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
}) {
  return (
    <div className={cn("relative w-full", className ?? "")}>
      <textarea
        placeholder={placeholder || "Placeholder"}
        value={value}
        rows={rows}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="
          bg-transparent
          w-full
          border
          border-trooper-black
          box-border
          rounded-xl
          px-4
          pt-3
          pb-10
          pr-10
          text-[16px]
          text-charcoal
          placeholder:text-charcoal/70
          outline-none
          resize-none
        "
      />
      <img
        src={BoneIcon}
        alt=""
        aria-hidden="true"
        className="absolute bottom-3 right-3 w-5 h-5 opacity-35 pointer-events-none select-none"
      />
    </div>
  );
}
