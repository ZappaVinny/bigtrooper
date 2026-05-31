import { cn } from "../lib/cn";

export default function Card({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-charcoal w-75 h-75", className ?? "")}>
      {children}
    </div>
  );
}
