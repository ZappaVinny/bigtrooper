import type { ReactNode } from "react";

export default function ModalFooter({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-row items-center justify-end gap-3 border-t border-line bg-cream/60 px-6 py-4">
      {children}
    </div>
  );
}
