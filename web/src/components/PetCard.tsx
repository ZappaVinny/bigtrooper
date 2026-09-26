import Card from "./Card";
import Button from "./Button";
import Toggle from "./Toggle";
import { PencilIcon, QrIcon, TrashIcon } from "./icons";
import { cn } from "../lib/cn";
import DefaultPet from "../assets/default-pet.svg";

function formatAge(age: number) {
  if (age < 1) return "Under 1 yr";
  return `${age} ${age === 1 ? "yr" : "yrs"}`;
}

export default function PetCard({
  imageUrl,
  name,
  type,
  age,
  description,
  active,
  onEdit,
  onTag,
  onDelete,
  onActiveChange,
}: {
  imageUrl?: string;
  name: string;
  type?: string;
  age?: number;
  description?: string;
  active: boolean;
  onEdit?: () => void;
  onTag?: () => void;
  onDelete?: () => void;
  onActiveChange?: (active: boolean) => void;
}) {
  const meta = [type, age !== undefined ? formatAge(age) : undefined]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-menu">
      <div className="relative aspect-16/10 bg-trooper-tan/30">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <img src={DefaultPet} alt="" className="h-16 w-16 opacity-30" />
          </div>
        )}
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur",
            active ? "bg-cream-50/90 text-[#56724a]" : "bg-trooper-black/70 text-cream/80",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              active ? "bg-success" : "bg-cream/50",
            )}
          />
          {active ? "Tag active" : "Tag paused"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="truncate text-2xl text-trooper-black">{name}</h3>
        {meta && <p className="text-sm font-semibold text-charcoal/60">{meta}</p>}
        {description && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-charcoal/75">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
        <Toggle
          labelPosition="side"
          label="Active"
          checked={active}
          onChange={(val) => onActiveChange?.(val)}
          className="w-auto flex-row-reverse gap-2.5"
        />
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            icon={<QrIcon />}
            iconPosition="left"
            onClick={onTag}
          >
            Tag
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<PencilIcon />}
            iconPosition="left"
            onClick={onEdit}
            className="text-trooper-black"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            aria-label={`Delete ${name}`}
            className="w-9 px-0 text-danger hover:bg-danger/10"
          >
            <TrashIcon width={16} height={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
