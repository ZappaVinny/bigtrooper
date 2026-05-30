import ButtonPrimary from "./ButtonPrimary";

export default function ButtonPrimaryWithIcon({
  children,
  icon,
  iconAlt = "",
  iconPosition = "right",
  bgcolor = "bg-trooper-tan",
  bordercolor,
  height = "h-10",
  length = "w-32",
  to,
  onClick,
}: {
  children: React.ReactNode;
  icon: string;
  iconAlt?: string;
  iconPosition?: "left" | "right";
  bgcolor?: string;
  bordercolor?: string;
  height?: string;
  length?: string;
  to?: string;
  onClick?: () => void;
}) {
  return (
    <ButtonPrimary
      bgcolor={bgcolor}
      bordercolor={bordercolor}
      height={height}
      length={length}
      to={to}
      onClick={onClick}
    >
      <span className="flex items-center justify-center gap-2">
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
