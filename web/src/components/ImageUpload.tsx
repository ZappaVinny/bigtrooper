import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { cn } from "../lib/cn";
import DefaultPet from "../assets/default-pet.svg";

export default function ImageUpload({
  onFileSelect,
  className,
}: {
  onFileSelect?: (file: File) => void;
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
      {previewUrl ? (
        <img src={previewUrl} alt="Selected pet" className="h-full w-full object-cover" />
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
