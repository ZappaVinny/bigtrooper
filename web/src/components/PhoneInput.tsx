import { useState } from "react";
import { cn } from "../lib/cn";

function digitsOnly(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("1") ? digits.slice(1) : digits;
}

function formatForDisplay(value: string): string {
  const digits = digitsOnly(value).slice(0, 10);
  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  if (digits.length > 6) return `(${area}) ${prefix}-${line}`;
  if (digits.length > 3) return `(${area}) ${prefix}`;
  if (digits.length > 0) return `(${area}`;
  return "";
}

function formatForValue(value: string): string {
  const digits = digitsOnly(value).slice(0, 10);
  return digits ? `+1${digits}` : "";
}

export default function PhoneInput({
  className,
  placeholder = "(555) 555-5555",
  value,
  onChange,
}: {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [display, setDisplay] = useState(() => formatForDisplay(value ?? ""));

  return (
    <div className={cn("relative w-full", className ?? "")}>
      <input
        placeholder={placeholder}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={display}
        onChange={(e) => {
          const formatted = formatForDisplay(e.target.value);
          setDisplay(formatted);
          onChange?.(formatForValue(formatted));
        }}
        className="
          bg-transparent
          h-12
          w-full
          border
          border-trooper-black
          box-border
          rounded-xl
          px-4
          py-0
          text-[16px]
          leading-none
          text-charcoal
          placeholder:text-[16px]
          placeholder:leading-none
          placeholder:text-charcoal/70
          outline-none
        "
      />
    </div>
  );
}
