import { useNavigate } from "react-router-dom";
import { cn } from "../lib/cn";

export default function ButtonIcon({
  icon,
  iconAlt = "",
  className,
  to,
  onClick,
}: {
  icon: string;
  iconAlt?: string;
  className?: string;
  to?: string;
  onClick?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => { if (to) navigate(to); onClick?.(); }}
      className={cn(
        `flex
        items-center
        justify-center
        h-10
        w-10
        bg-none
        border-0
        cursor-pointer
        transition-transform
        duration-100
        active:scale-95`,
        className ?? ""
      )}
    >
      <img src={icon} alt={iconAlt} className="h-full w-full" />
    </button>
  );
}
