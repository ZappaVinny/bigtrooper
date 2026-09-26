import type { ReactNode } from "react";

export default function ModalBody({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5 text-trooper-black">
      {children}
    </div>
  );
}
