import { useState } from "react";
import { cn } from "../lib/cn";

import EyeOpen from "../assets/password-eye-open.svg"
import EyeClose from "../assets/password-eye-close.svg"

export default function TextInput({
  className,
  placeholder = "",
  inputType = "text",
  value,
  onChange,
}: {
  className?: string;
  placeholder?: string;
  inputType?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = inputType === "password";
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : inputType;

  return (
    <div className={cn("relative w-full", className ?? "")}>
      <input
        placeholder={placeholder || "Placeholder"}
        type={resolvedType}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
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
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/60 hover:text-charcoal focus:outline-none"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <img
            src={showPassword ? EyeClose : EyeOpen}
            alt={showPassword ? "Hide password" : "Show password"}
            className="w-5 h-5"
          />
        </button>
      )}
    </div>
  );
}
