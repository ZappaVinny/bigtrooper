import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { cn } from "../lib/cn";
import DefaultPet from "../assets/default-pet.svg";

export default function ImageUpload({
  onFileSelect,
  initialUrl,
  className,
}: {
  onFileSelect?: (file: File) => void;
  /** The current photo, shown until a new file is picked. */
  initialUrl?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Release the old object URL whenever it's replaced or we unmount.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelect?.(file);
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={cn(
        "focus-ring group flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl cursor-pointer",
        "border-2 border-dashed border-trooper-black/15 bg-cream/50 transition-colors",
        "hover:border-trooper-amber/60 hover:bg-trooper-amber/5",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {previewUrl || initialUrl ? (
        <span className="relative block h-full w-full">
          <img
            src={previewUrl ?? initialUrl}
            alt={previewUrl ? "Selected pet photo" : "Current pet photo"}
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 grid place-items-center bg-trooper-black/0 text-sm font-bold text-cream opacity-0 transition-all group-hover:bg-trooper-black/40 group-hover:opacity-100">
            Change photo
          </span>
        </span>
      ) : (
        <>
          <img src={DefaultPet} alt="" className="h-10 w-10 opacity-35" />
          <span className="text-sm font-bold text-charcoal/70 group-hover:text-trooper-amber">
            Choose a photo
          </span>
          <span className="text-xs text-charcoal/50">JPG or PNG</span>
        </>
      )}
    </button>
  );
}
