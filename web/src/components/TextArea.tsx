import { cn } from "../lib/cn";
import BoneIcon from "../assets/bone.svg";

export default function TextArea({
  className,
  placeholder = "",
  value,
  onChange,
  rows = 4,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  return (
    <div className={cn("relative w-full", className)}>
      <textarea
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        placeholder={placeholder}
        value={value}
        rows={rows}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="field block py-3 pb-9 pr-10 resize-none leading-relaxed"
      />
      <img
        src={BoneIcon}
        alt=""
        aria-hidden="true"
        className="absolute bottom-3 right-3 w-5 h-5 opacity-30 pointer-events-none select-none"
      />
    </div>
  );
}
