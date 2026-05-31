import { useState } from "react";
import ChevronDown from "../assets/chevron-down.svg";
import { cn } from "../lib/cn";

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
  icon = ChevronDown,
  value,
  onChange,
  open: controlledOpen,
  onOpenChange,
}: {
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  icon?: string;
  value?: string;
  onChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  function setOpen(next: boolean) {
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  }

  const selectedOption = options.find((option) => option.value === value);

  function handleSelect(option: DropdownOption) {
    onChange?.(option.value);
    setOpen(false);
  }

  return (
    <div className={cn("relative w-72", className ?? "")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          `bg-cream
          h-12
          w-full
          border
          border-trooper-black
          box-border
          flex
          items-center
          justify-between
          px-3
          text-left
          text-[18px]
          text-trooper-black
          cursor-pointer`,
          open ? "rounded-t-xl" : "rounded-xl",
          className ?? ""
        )}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>

        <img
          src={icon}
          alt=""
          className={`
            h-[1.25em]
            w-[1.25em]
            transition-transform
            duration-150
            ${open ? "rotate-180" : "rotate-0"}
          `}
        />
      </button>

      {open && (
        <div
          className="
            absolute
            left-0
            top-full
            z-20
            w-full
            overflow-hidden
            rounded-b-xl
            border
            border-trooper-black
            bg-cream
          "
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className="
                flex
                w-full
                items-center
                justify-between
                gap-3
                px-3
                py-2
                text-left
                text-trooper-black
                hover:bg-trooper-tan/30
                cursor-pointer
              "
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[18px] ">{option.label}</span>

                {option.description && (
                  <span className="text-[9px] font-normal text-charcoal">
                    {option.description}
                  </span>
                )}
              </div>

              {option.icon && (
                <img
                  src={option.icon}
                  alt=""
                  className="h-[1.25em] w-[1.25em]"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
