import { useNavigate } from "react-router-dom";

export default function ButtonPrimary({
  children,
  bgcolor = "bg-trooper-tan",
  bordercolor,
  height = "h-10",
  length = "w-32",
  to,
  onClick,
}: {
  children: React.ReactNode;
  bgcolor?: string;
  bordercolor?: string;
  height?: string;
  length?: string;
  to?: string;
  onClick?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => { if (to) navigate(to); onClick?.(); }}
      className={`
        flex
        flex-col
        items-center
        justify-center
        ${bgcolor}
        ${height}
        ${length}
        ${bordercolor ? `border-[3px] ${bordercolor}` : "border-0"}
        rounded-2xl
        text-[24px]
        text-trooper-black
        cursor-pointer
        transition-transform
        duration-100
        active:scale-95
      `}
    >
      {children}
    </button>
  )
}
