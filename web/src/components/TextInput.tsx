import { useState } from "react";
import { cn } from "../lib/cn";

import EyeOpen from "../assets/password-eye-open.svg";
import EyeClose from "../assets/password-eye-close.svg";

export default function TextInput({
  className,
  placeholder = "",
  inputType = "text",
  value,
  onChange,
  id,
  autoComplete,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  className?: string;
  placeholder?: string;
  inputType?: string;
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  autoComplete?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = inputType === "password";
  const resolvedType = isPassword
    ? showPassword
      ? "text"
      : "password"
    : inputType;

  return (
    <div className={cn("relative w-full", className)}>
      <input
        id={id}
        placeholder={placeholder}
        type={resolvedType}
        value={value ?? ""}
        autoComplete={autoComplete}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={cn("field h-11", isPassword && "pr-11")}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full opacity-60 hover:opacity-100 hover:bg-trooper-black/5 transition"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <img src={showPassword ? EyeClose : EyeOpen} alt="" className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
