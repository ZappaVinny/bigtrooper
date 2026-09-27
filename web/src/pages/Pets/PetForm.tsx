import { useState, type SyntheticEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import FormField from "../../components/FormField";
import FormMessage from "../../components/FormMessage";
import TextInput from "../../components/TextInput";
import TextArea from "../../components/TextArea";
import SelectInput from "../../components/SelectInput";
import ImageUpload from "../../components/ImageUpload";
import { ArrowLeftIcon } from "../../components/icons";
import PawPrint from "../../assets/paw-print.svg";
import { apiFetch } from "../../api/client";
import { uploadPetImage } from "../../api/images";
import { PetUpdate, PetNew } from "../../types/api";

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

type Errors = Partial<Record<"name" | "age" | "type" | "description", string>>;

export default function PetForm({
  mode,
  initialData,
}: {
  mode: "edit" | "new";
  initialData?: PetFormData;
}) {
  const nav = useNavigate();
  const [name, setName] = useState(initialData?.name ?? "");
  const [age, setAge] = useState(initialData?.age?.toString() ?? "");
  const [type, setType] = useState(initialData?.type?.toLowerCase() ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [typeOpen, setTypeOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const [phase, setPhase] = useState<"idle" | "saving" | "uploading">("idle");
  const [photo, setPhoto] = useState<File | null>(null);
  // Set when a new pet saved but its photo didn't (see handleSubmit).
  const [photoError, setPhotoError] = useState(
    (useLocation().state as { photoError?: string } | null)?.photoError ?? "",
  );

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Name is required.";
    const ageNum = Number(age);
    if (age === "" || !Number.isInteger(ageNum) || ageNum < 0 || ageNum > 40)
      next.age = "Whole years only.";
    if (!type) next.type = "Choose a pet type.";
    if (!description.trim()) next.description = "Add a short description.";
    return next;
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    const body: PetNew | PetUpdate =
      mode === "new"
        ? { name, type: capitalizedType, age: Number(age), description, active: true }
        : { name, type: capitalizedType, age: Number(age), description };

    setPhotoError("");
    setPhase("saving");
    let petId = initialData?.id;
    try {
      const res = await apiFetch(mode === "new" ? "/pets/create" : `/pets/${initialData?.id}`, {
        method: mode === "new" ? "POST" : "PATCH",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (mode === "new") petId = (await res.json()).id;
    } catch (err) {
      console.error(err);
      setSubmitError("We couldn't save this pet. Please try again.");
      setPhase("idle");
      return;
    }

    if (photo && petId !== undefined) {
      setPhase("uploading");
      try {
        await uploadPetImage(petId, photo);
      } catch (err) {
        const message = `Your pet was saved, but the photo wasn't: ${
          err instanceof Error ? err.message : "please try again."
        }`;
        setPhase("idle");
        if (mode === "new") {
          // The pet exists now, so retrying here would create a duplicate.
          // Continue on its edit page, where saving again is safe.
          nav(`/pets/${petId}/edit`, { replace: true, state: { photoError: message } });
        } else {
          setPhotoError(message);
        }
        return;
      }
    }

    nav("/pets");
  }

  return (
    <PageShell
      title={mode === "edit" ? `Edit ${initialData?.name ?? "pet"}` : "Add a pet"}
      subtitle={
        mode === "edit"
          ? "Changes show up the next time their tag is scanned."
          : "This is what a finder sees when they scan the tag."
      }
      eyebrow={
        <Link
          to="/pets"
          className="focus-ring inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-bold text-charcoal/60 hover:text-trooper-amber"
        >
          <ArrowLeftIcon width={16} height={16} /> Your pets
        </Link>
      }
      width="md"
    >
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          {submitError && <FormMessage>{submitError}</FormMessage>}

          {photoError && <FormMessage>{photoError}</FormMessage>}

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-charcoal">Photo</span>
            <ImageUpload
              className="h-56"
              initialUrl={initialData?.imageUrl}
              onFileSelect={(file) => {
                setPhoto(file);
                setPhotoError("");
              }}
            />
            <p className="text-xs text-charcoal/60">
              A clear, recent photo helps finders recognize your pet.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[2fr_1fr_1.5fr]">
            <FormField label="Name" error={errors.name}>
              <TextInput placeholder="Trooper" value={name} onChange={setName} />
            </FormField>
            <FormField label="Age (years)" error={errors.age}>
              <TextInput placeholder="3" inputType="number" value={age} onChange={setAge} />
            </FormField>
            <FormField label="Type" error={errors.type}>
              <SelectInput
                placeholder="Choose"
                options={PET_TYPE_OPTIONS}
                value={type}
                onChange={setType}
                open={typeOpen}
                onOpenChange={setTypeOpen}
              />
            </FormField>
          </div>

          <FormField
            label="Description"
            hint="Anything a finder should know: temperament, medical needs, favorite treats."
            error={errors.description}
          >
            <TextArea
              placeholder="Friendly but shy with strangers. Loves cheese."
              value={description}
              onChange={setDescription}
              rows={5}
            />
          </FormField>

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
            <Button variant="ghost" size="lg" to="/pets" className="text-trooper-black">
              Cancel
            </Button>
            <Button type="submit" size="lg" icon={PawPrint} disabled={phase !== "idle"}>
              {phase === "saving"
                ? "Saving…"
                : phase === "uploading"
                  ? "Uploading photo…"
                  : mode === "edit"
                    ? "Save changes"
                    : "Add pet"}
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
