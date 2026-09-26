import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/cn";

type Variant = "primary" | "dark" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base = `
  focus-ring
  inline-flex items-center justify-center gap-2 shrink-0
  rounded-full font-sans font-bold whitespace-nowrap
  cursor-pointer select-none
  transition-[background-color,color,border-color,box-shadow,transform] duration-150
  active:scale-[0.97]
  disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
  hover:no-underline
`;

const variants: Record<Variant, string> = {
  primary: "bg-trooper-tan text-trooper-black hover:bg-[#bb955f] shadow-sm",
  dark: "bg-trooper-black text-cream hover:bg-charcoal shadow-sm",
  outline:
    "bg-transparent text-current border-[1.5px] border-current hover:bg-trooper-black/5",
  ghost: "bg-transparent text-current hover:bg-trooper-black/5",
  danger: "bg-ear-pink text-trooper-black hover:bg-[#dea08a]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-7 text-base",
};

type ButtonProps = {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  /** An image URL, or an inline icon element (e.g. from ./icons). */
  icon?: string | ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  className?: string;
  to?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "right",
  fullWidth = false,
  className,
  to,
  type = "button",
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );

  const iconEl =
    typeof icon === "string" ? (
      <img src={icon} alt="" aria-hidden="true" className="h-[1.1em] w-[1.1em]" />
    ) : (
      icon && <span className="inline-flex [&>svg]:h-[1.1em] [&>svg]:w-[1.1em]">{icon}</span>
    );

  const content = (
    <>
      {iconPosition === "left" && iconEl}
      {children}
      {iconPosition === "right" && iconEl}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} onClick={onClick} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
