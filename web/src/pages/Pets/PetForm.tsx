import { useState } from "react";
import ButtonPrimary from "../../components/ButtonPrimary";
import TextInput from "../../components/TextInput";
import TextArea from "../../components/TextArea";
import SelectInput from "../../components/SelectInput";
import ImageUpload from "../../components/ImageUpload";
import { apiFetch } from "../../api/client";
import { PetUpdate } from "../../types/api";

const PET_TYPE_OPTIONS = [
  { label: "Dog", value: "dog" },
  { label: "Cat", value: "cat" },
  { label: "Bird", value: "bird" },
  { label: "Rabbit", value: "rabbit" },
  { label: "Other", value: "other" },
];

export type PetFormData = {
  id: number;
  name: string;
  age: number;
  type: string;
  description: string;
  imageUrl?: string;
};

export default function PetForm({
  mode,
  initialData,
}: {
  mode: "edit" | "new";
  initialData?: PetFormData;
}) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [age, setAge] = useState(initialData?.age ?? 0);
  const [type, setType] = useState(initialData?.type?.toLowerCase() ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [typeOpen, setTypeOpen] = useState(false);

  function handleSubmit() {
    const patchPet = async (patch: PetUpdate) => {
      try {
        const res = await apiFetch("/pets/" + initialData?.id, {
          method: "PATCH",
          body: JSON.stringify({ ...patch }),
        });
      } catch (err) {
        if ((err as DOMException).name !== "AbortError") {
          console.log(err);
        }
      }
    };

    const newPatch: PetUpdate = {
      name: name,
      type: type ? type.charAt(0).toUpperCase() + type.slice(1) : type,
      age: age,
      description: description
    };

    patchPet(newPatch);
  }

  const heading =
    mode === "edit" ? `Edit ${initialData?.name ?? "Pet"}` : "New Pet";

  return (
    <div className="flex flex-col items-center py-10 px-6 gap-6 min-h-[calc(100vh-72px)]">
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-[40px] font-bold text-trooper-black">{heading}</h1>
      </div>

      {/* Image Section */}
      {mode === "edit" && initialData?.imageUrl ? (
        <div className="flex gap-6 w-full max-w-3xl h-56">
          <img
            src={initialData.imageUrl}
            alt={initialData.name}
            className="flex-1 rounded-2xl object-cover border-2 border-trooper-black/10"
          />
          <ImageUpload className="flex-1" />
        </div>
      ) : (
        <div className="w-full max-w-3xl h-56 flex justify-center">
          <ImageUpload className="max-w-sm w-full" />
        </div>
      )}

      {/* Information */}
      <div className="flex flex-col items-center gap-1 w-full max-w-3xl">
        <h2 className="text-[24px] font-bold text-trooper-black self-start">
          Information
        </h2>
        <div className="flex flex-row gap-5 w-full">
          <div className="flex flex-col items-center flex-1">
            <label className="text-[20px] text-trooper-black">Pet's Name</label>
            <TextInput
              placeholder="PetName"
              value={name}
              onChange={setName}
              className="w-full"
            />
          </div>
          <div className="flex flex-col items-center flex-1">
            <label className="text-[20px] text-trooper-black">Pet's Age</label>
            <TextInput
              placeholder="0"
              inputType="number"
              value={age.toString()}
              onChange={(v) => setAge(Number(v))}
              className="w-full"
            />
          </div>
          <div className="flex flex-col items-center flex-1">
            <label className="text-[20px] text-trooper-black">Pet Type</label>
            <SelectInput
              placeholder="Selected"
              options={PET_TYPE_OPTIONS}
              value={type}
              onChange={setType}
              open={typeOpen}
              onOpenChange={setTypeOpen}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1 w-full max-w-3xl">
        <label className="text-[20px] text-trooper-black text-center">
          Description of Pet
        </label>
        <TextArea
          placeholder="Description of this pet..."
          value={description}
          onChange={setDescription}
          rows={5}
        />
      </div>

      {/* Submit */}
      <ButtonPrimary
        onClick={handleSubmit}
        className="h-12 w-full max-w-3xl bg-trooper-tan border-[3px] border-trooper-black text-[20px]"
      >
        Save Changes
      </ButtonPrimary>
    </div>
  );
}
