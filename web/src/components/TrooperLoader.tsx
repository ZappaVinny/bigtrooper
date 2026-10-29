import TrooperRunSprite from "../assets/trooper-run-sprite.webp";

// Loader for waits longer than a few seconds: Trooper gallops along a track
// while an indeterminate bar runs underneath. With reduced motion the dog
// stays still in the middle.
export default function TrooperLoader({
  title,
  message,
  hint,
}: {
  title: string;
  message?: string;
  hint?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-5 py-8 text-center"
    >
      <div className="relative h-20 w-full max-w-sm overflow-hidden">
        <div className="absolute inset-x-0 bottom-1 h-px bg-trooper-tan/40" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 motion-safe:animate-run-across">
          <div
            aria-hidden
            style={{ backgroundImage: `url(${TrooperRunSprite})` }}
            className="aspect-640/263 h-16 bg-size-[400%_100%] bg-no-repeat motion-safe:animate-gallop"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display text-2xl text-trooper-black">{title}</p>
        {message && <p className="text-sm font-semibold text-charcoal/70">{message}</p>}
      </div>
      <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-trooper-tan/30">
        <div className="h-full w-2/5 animate-indeterminate rounded-full bg-trooper-amber" />
      </div>
      {hint && <p className="max-w-xs text-xs text-charcoal/55">{hint}</p>}
    </div>
  );
}
