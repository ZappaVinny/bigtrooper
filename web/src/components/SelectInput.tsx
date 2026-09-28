import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/cn";
import { useDismiss } from "../lib/useDismiss";
import { ChevronDownIcon } from "./icons";

const MENU_MAX_HEIGHT = 280;

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
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  function setOpen(next: boolean) {
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  }

  useDismiss([rootRef, menuRef], open, () => setOpen(false));

  // The menu is portaled to <body> with fixed positioning so it floats over
  // modals and scroll containers instead of being clipped by them. It opens
  // downward, or upward when there isn't room below.
  function placeMenu() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const gap = 6;
    const below = window.innerHeight - rect.bottom - gap;
    const above = rect.top - gap;
    const wanted = Math.min(options.length * 40 + 10, MENU_MAX_HEIGHT);
    const up = below < wanted && above > below;
    setMenuStyle({
      left: rect.left,
      width: rect.width,
      maxHeight: Math.min(MENU_MAX_HEIGHT, (up ? above : below) - 8),
      ...(up
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  }

  // Keep the menu attached to its trigger while anything scrolls or resizes.
  const placeMenuRef = useRef(placeMenu);
  useEffect(() => {
    placeMenuRef.current = placeMenu;
  });
  useEffect(() => {
    if (!open) return;
    const update = () => placeMenuRef.current();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

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
        ref={triggerRef}
        onClick={() => {
          if (!open) placeMenu();
          setOpen(!open);
        }}
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

      {open && createPortal(
        <ul
          ref={menuRef}
          role="listbox"
          style={menuStyle}
          className="fixed z-60 overflow-y-auto rounded-xl border border-line bg-cream-50 p-1 shadow-menu"
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
                  <span className="flex min-w-0 flex-col">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs font-normal leading-snug text-charcoal/60">
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
        </ul>,
        document.body,
      )}
    </div>
  );
}
