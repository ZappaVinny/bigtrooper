import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  const [saving, setSaving] = useState(false);

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

    setSaving(true);
    try {
      const res = await apiFetch(mode === "new" ? "/pets/create" : `/pets/${initialData?.id}`, {
        method: mode === "new" ? "POST" : "PATCH",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      nav("/pets");
    } catch (err) {
      console.error(err);
      setSubmitError("We couldn't save this pet. Please try again.");
    } finally {
      setSaving(false);
    }
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

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-charcoal">Photo</span>
            <div className="flex gap-4">
              {initialData?.imageUrl && (
                <img
                  src={initialData.imageUrl}
                  alt={initialData.name}
                  className="h-44 w-44 shrink-0 rounded-2xl border border-line object-cover"
                />
              )}
              <ImageUpload className="h-44" />
            </div>
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
            <Button type="submit" size="lg" icon={PawPrint} disabled={saving}>
              {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Add pet"}
            </Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
