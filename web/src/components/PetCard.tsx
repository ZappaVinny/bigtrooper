import { useState } from "react";
import Card from "./Card";
import ButtonPrimary from "./ButtonPrimary";
import Toggle from "./Toggle";
import DefaultPet from "../assets/default-pet.svg";

export default function PetCard({
  imageUrl,
  name = "Pet Name",
  pet_id,
  active: initialActive = false,
  onEdit,
  onDelete,
  onActiveChange,
}: {
  imageUrl?: string;
  name?: string;
  pet_id?: number;
  active?: boolean;
  onEdit?: () => void;
  onDelete?: (id: number) => void;
  onActiveChange?: (active: boolean, id: number) => void;
}) {
  const [active, setActive] = useState(initialActive);

  return (
    <Card className="bg-trooper-tan w-107.5 h-82.5 border-trooper-black border-2 flex flex-col overflow-hidden">
      <div className="flex-1 rounded-t-2xl overflow-hidden bg-trooper-tan flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={DefaultPet}
            alt="Default pet"
            className="w-20 h-20 opacity-60"
          />
        )}
      </div>

      <div className="py-2 text-center">
        <span className="font-display text-xl font-bold text-trooper-black">
          {name}
        </span>
      </div>

      <div className="flex items-center justify-between px-4 pb-4">
        <div className="flex gap-3">
          <ButtonPrimary
            onClick={onEdit}
            className="bg-trooper-black text-cream w-24 h-9 text-lg rounded-xl"
          >
            Edit
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => onDelete?.(pet_id!)}
            className="bg-ear-pink text-trooper-black w-24 h-9 text-lg rounded-xl"
          >
            Delete
          </ButtonPrimary>
        </div>
        <Toggle
          label="Active"
          checked={active}
          onChange={(val) => {
            setActive(val);
            onActiveChange?.(val, pet_id!);
          }}
        />
      </div>
    </Card>
  );
}
