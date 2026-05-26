import { useNavigate } from "react-router-dom";

export default function ButtonPrimary({
  children,
  bgcolor = "bg-trooper-tan",
  bordercolor,
  height = "h-10",
  length = "w-32",
  to,
}: {
  children: React.ReactNode;
  bgcolor?: string;
  bordercolor?: string;
  height?: string;
  length?: string;
  to?: string;
}) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => to && navigate(to)}
      className={`flex flex-col ${bgcolor} text-trooper-black ${height} ${length} rounded-2xl justify-center text-[24px] ${bordercolor ? `border-[3px] ${bordercolor}` : "border-0"}`}
    >
      {children}
    </button>
  );
}
