import { useState } from "react";

export default function TextInput({
  bgcolor = "bg-transparent",
  bordercolor = "border-trooper-black",
  height = "h-12",
  length = "w-full",
  placeholder = "",
  inputType = "text",
}: {
  bgcolor?: string;
  bordercolor?: string;
  height?: string;
  length?: string;
  placeholder?: string;
  inputType?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = inputType === "password";
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : inputType;

  const inputEl = (
    <input
      placeholder={placeholder || "Placeholder"}
      type={resolvedType}
      className={`
        ${bgcolor}
        ${height}
        ${length}
        ${bordercolor ? `border ${bordercolor}` : "border-0"}
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
      `}
    />
  );

  if (!isPassword) return inputEl;

  return (
    <div className="relative">
      {inputEl}
      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/60 hover:text-charcoal focus:outline-none"
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
