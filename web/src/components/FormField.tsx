import { cloneElement, isValidElement, useId } from "react";
import type { ReactElement } from "react";
import { cn } from "../lib/cn";

type FieldChildProps = {
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

export default function FormField({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactElement<FieldChildProps>;
}) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error || hint;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": message ? messageId : undefined,
      })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-charcoal">
        {label}
      </label>
      {control}
      {message && (
        <p
          id={messageId}
          className={cn("text-xs", error ? "text-danger" : "text-charcoal/60")}
        >
          {message}
        </p>
      )}
    </div>
  );
}
