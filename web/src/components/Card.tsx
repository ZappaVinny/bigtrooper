import { cn } from "../lib/cn";

export default function Card({
  children,
  className,
  onClick,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div className={cn("rounded-2xl bg-charcoal w-75 h-75", className ?? "")} onClick={onClick}>
      {children}
    </div>
  );
}
