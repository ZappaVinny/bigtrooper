import ButtonPrimary from "./ButtonPrimary";

export default function ButtonPrimaryWithIcon({
  children,
  icon,
  iconAlt = "",
  iconPosition = "right",
  className,
  to,
  onClick,
}: {
  children: React.ReactNode;
  icon: string;
  iconAlt?: string;
  iconPosition?: "left" | "right";
  className?: string;
  to?: string;
  onClick?: () => void;
}) {
  return (
    <ButtonPrimary
      className={className}
      to={to}
      onClick={onClick}
    >
      <span className="flex items-center justify-center gap-2 h-full">
        {iconPosition === "left" && (
          <img src={icon} alt={iconAlt} className="h-[1em] w-[1em]" />
        )}

        <span>{children}</span>

        {iconPosition === "right" && (
          <img src={icon} alt={iconAlt} className="h-[1em] w-[1em]" />
        )}
      </span>
    </ButtonPrimary>
  );
}
