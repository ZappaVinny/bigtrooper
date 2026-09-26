import { useEffect, useRef, type RefObject } from "react";

// Calls onDismiss when the user clicks outside `ref` or presses Escape,
// but only while `active` is true.
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: () => void,
) {
  // Kept in a ref so the listeners never go stale when callers pass a new
  // callback each render.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!active) return;
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) onDismissRef.current();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onDismissRef.current();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active, ref]);
}
