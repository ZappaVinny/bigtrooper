import type { ReactNode } from "react";
import { CloseIcon } from "./icons";

export default function ModalHeader({
  children,
  onClose,
  id,
}: {
  children?: ReactNode;
  onClose: () => void;
  id?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
      <h2 id={id} className="text-2xl text-trooper-black">
        {children}
      </h2>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="focus-ring -mr-2 grid h-9 w-9 place-items-center rounded-full text-charcoal/60 transition-colors hover:bg-trooper-black/5 hover:text-trooper-black cursor-pointer"
      >
        <CloseIcon />
      </button>
    </div>
  );
}
