import { useRef, useState } from "react";
import { cn } from "../lib/cn";
import { useDismiss } from "../lib/useDismiss";
import { ChevronDownIcon } from "./icons";

type DropdownOption = {
  label: string;
  value: string;
  description?: string;
  icon?: string;
};

export default function SelectInput({
  options,
  placeholder = "Select",
  className,
  icon,
  value,
  onChange,
  open: controlledOpen,
  onOpenChange,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  icon?: string;
  value?: string;
  onChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  function setOpen(next: boolean) {
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  }

  useDismiss(rootRef, open, () => setOpen(false));

  const selectedOption = options.find((option) => option.value === value);

  function handleSelect(option: DropdownOption) {
    onChange?.(option.value);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        onClick={() => setOpen(!open)}
        className={cn(
          "field h-11 flex items-center justify-between text-left cursor-pointer",
          open && "border-trooper-amber",
        )}
      >
        <span className={cn(!selectedOption && "text-charcoal/45")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {icon ? (
          <img
            src={icon}
            alt=""
            className={cn("h-5 w-5 opacity-60 transition-transform duration-150", open && "rotate-180")}
          />
        ) : (
          <ChevronDownIcon
            className={cn("text-charcoal/60 transition-transform duration-150", open && "rotate-180")}
          />
        )}
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-line bg-cream-50 p-1 shadow-menu"
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-trooper-black cursor-pointer hover:bg-trooper-tan/25",
                    selected && "bg-trooper-tan/35 font-semibold",
                  )}
                >
                  <span className="flex items-baseline gap-2">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-charcoal/60">
                        {option.description}
                      </span>
                    )}
                  </span>
                  {option.icon && (
                    <img src={option.icon} alt="" className="h-5 w-5" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
