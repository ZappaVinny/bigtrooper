import { cn } from "../lib/cn";

export default function Modal({
  children,
  className,
  onClose,
}: {
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          `flex
          flex-col
          bg-white
          w-150
          rounded-2xl
          border-[3px]
          border-trooper-black
          overflow-hidden`,
          className ?? ""
        )}
      >
        {children}
      </div>
    </div>
  );
}
