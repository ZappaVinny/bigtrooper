import { useEffect, useRef, type RefObject } from "react";

type ElementRef = RefObject<HTMLElement | null>;
type Layer = { refs: ElementRef[] };

// Stack of currently open dismissable layers, innermost last.
const openLayers: Layer[] = [];

const contains = (layer: Layer, target: Node) =>
  layer.refs.some((r) => r.current?.contains(target));

// Calls onDismiss when the user clicks outside the given element(s) or
// presses Escape, but only while `active` is true. Pass several refs when a
// layer is split across the page (e.g. a trigger plus a menu rendered in a
// portal).
export function useDismiss(
  refs: ElementRef | ElementRef[],
  active: boolean,
  onDismiss: () => void,
) {
  // Kept in refs so the listeners never go stale when callers pass new
  // values each render.
  const onDismissRef = useRef(onDismiss);
  const refsRef = useRef(refs);
  useEffect(() => {
    onDismissRef.current = onDismiss;
    refsRef.current = refs;
  });

  useEffect(() => {
    if (!active) return;
    const layer: Layer = {
      get refs() {
        const r = refsRef.current;
        return Array.isArray(r) ? r : [r];
      },
    };
    openLayers.push(layer);

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (contains(layer, target)) return;
      // A click inside a layer opened on top of this one (e.g. a dropdown
      // menu floating over a modal) isn't "outside" this layer.
      const above = openLayers.slice(openLayers.indexOf(layer) + 1);
      if (above.some((l) => contains(l, target))) return;
      onDismissRef.current();
    }
    function onKeyDown(e: KeyboardEvent) {
      // Escape closes only the most recently opened layer (e.g. a dropdown
      // inside a modal), not everything at once.
      if (e.key === "Escape" && openLayers[openLayers.length - 1] === layer) {
        onDismissRef.current();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      openLayers.splice(openLayers.indexOf(layer), 1);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active]);
}
