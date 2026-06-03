import { useRef, useState } from "react";
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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
        `flex flex-col items-center justify-center gap-3
        border-2 border-dashed border-trooper-black/40
        rounded-2xl
        cursor-pointer
        hover:border-trooper-amber/70
        hover:bg-trooper-amber/5
        transition-colors duration-150
        overflow-hidden
        w-full h-full`,
        className ?? ""
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
        <img src={previewUrl} alt="Selected pet" className="w-full h-full object-cover" />
      ) : (
        <>
          <img src={DefaultPet} alt="" className="w-12 h-12 opacity-40" />
          <span className="text-sm font-semibold text-trooper-black/50 not-fancy">
            Select New Image
          </span>
        </>
      )}
    </button>
  );
}
