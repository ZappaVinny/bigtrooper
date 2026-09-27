import { useState } from "react";
import { cn } from "../lib/cn";
import { formatPhoneForDisplay, normalizePhone } from "../lib/phone";

export default function PhoneInput({
  className,
  placeholder = "(555) 555-5555",
  value,
  onChange,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const [display, setDisplay] = useState(() => formatPhoneForDisplay(value ?? ""));

  return (
    <div className={cn("relative w-full", className)}>
      <input
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        placeholder={placeholder}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={display}
        onChange={(e) => {
          const formatted = formatPhoneForDisplay(e.target.value);
          setDisplay(formatted);
          onChange?.(normalizePhone(formatted));
        }}
        className="field h-11"
      />
    </div>
  );
}
