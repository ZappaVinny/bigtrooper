import { useEffect, useRef, useState } from "react";

import Modal from "./Modal";
import ModalHeader from "./ModalHeader";
import ModalBody from "./ModalBody";
import ModalFooter from "./ModalFooter";
import Button from "./Button";
import FormField from "./FormField";
import FormMessage from "./FormMessage";
import SelectInput from "./SelectInput";
import Toggle from "./Toggle";
import { QrIcon } from "./icons";
import { cn } from "../lib/cn";
import {
  generateTag,
  type TagFormat,
  type TagOptions,
  type TagSize,
} from "../api/tags";

// !QRTAG! Sample renders for each size. Drop images into src/assets, import
// them here and set `image`; until then each card shows a placeholder slot.
const TAG_SIZES: { value: TagSize; label: string; hint: string; image?: string }[] = [
  { value: "small", label: "Small", hint: "Cats & small dogs" },
  { value: "medium", label: "Medium", hint: "Most dogs" },
  { value: "large", label: "Large", hint: "Large breeds" },
];

const FORMAT_OPTIONS = [
  { label: "STL", value: "stl", description: "Works with most printers" },
  { label: "3MF", value: "3mf", description: "Newer slicers" },
];

// Shown in turn while the request is in flight so a slow response still
// reads as progress, not a frozen screen.
const PROGRESS_STEPS = [
  "Creating your QR code…",
  "Building the 3D model…",
  "Preparing your download…",
];

function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("animate-spin", className)}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function TagModal({
  petId,
  petName,
  onClose,
}: {
  petId: number;
  petName: string;
  onClose: () => void;
}) {
  const [options, setOptions] = useState<TagOptions>({
    size: "medium",
    includeName: true,
    format: "stl",
  });
  const [formatOpen, setFormatOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Cycle the status text while generating.
  useEffect(() => {
    if (!generating) return;
    const timer = setInterval(
      () => setStep((s) => Math.min(s + 1, PROGRESS_STEPS.length - 1)),
      1600,
    );
    return () => clearInterval(timer);
  }, [generating]);

  // Cancel any in-flight request if the modal unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  function update(patch: Partial<TagOptions>) {
    setOptions((o) => ({ ...o, ...patch }));
    setError("");
    setDone(false);
  }

  async function handleGenerate() {
    setError("");
    setDone(false);
    setStep(0);
    setGenerating(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // !QRTAG! This is where the backend request happens (see src/api/tags.ts).
      const file = await generateTag(petId, options, controller.signal);
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${petName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-tag-${options.size}.${options.format}`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      if ((err as DOMException).name === "AbortError") return;
      setError("Tag generation can't be completed at the moment. Please try again later.");
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setGenerating(false);
      }
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setGenerating(false);
  }

  function handleClose() {
    abortRef.current?.abort();
    onClose();
  }

  return (
    <Modal onClose={handleClose} labelledBy="tag-modal-title" className="max-w-xl">
      <ModalHeader id="tag-modal-title" onClose={handleClose}>
        Tag for {petName}
      </ModalHeader>

      <ModalBody>
        {generating ? (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center gap-5 py-10 text-center"
          >
            <div className="relative grid h-20 w-20 place-items-center">
              <Spinner className="absolute inset-0 h-20 w-20 text-trooper-amber" />
              <QrIcon width={28} height={28} className="text-trooper-black" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-display text-2xl text-trooper-black">Generating your tag</p>
              <p className="text-sm font-semibold text-charcoal/70">{PROGRESS_STEPS[step]}</p>
            </div>
            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-trooper-tan/30">
              <div className="h-full w-2/5 animate-indeterminate rounded-full bg-trooper-amber" />
            </div>
            <p className="max-w-xs text-xs text-charcoal/55">
              This can take a few seconds. Keep this window open. Your file will
              download automatically.
            </p>
          </div>
        ) : (
          <>
            {error && <FormMessage>{error}</FormMessage>}
            {done && (
              <FormMessage tone="success">
                Your tag is ready. Check your downloads folder.
              </FormMessage>
            )}

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1.5 text-sm font-semibold text-charcoal">Size</legend>
              <div className="grid grid-cols-3 gap-3">
                {TAG_SIZES.map((s) => {
                  const selected = options.size === s.value;
                  return (
                    <label
                      key={s.value}
                      className={cn(
                        "group flex cursor-pointer flex-col gap-2 rounded-2xl border bg-cream-50 p-2.5 transition-all",
                        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-trooper-amber/60",
                        selected
                          ? "border-trooper-amber shadow-card ring-1 ring-trooper-amber"
                          : "border-line hover:border-trooper-black/25",
                      )}
                    >
                      <input
                        type="radio"
                        name="tag-size"
                        value={s.value}
                        checked={selected}
                        onChange={() => update({ size: s.value })}
                        className="sr-only"
                      />
                      {s.image ? (
                        <img
                          src={s.image}
                          alt={`${s.label} tag sample`}
                          className="aspect-square w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="grid aspect-square w-full place-items-center rounded-xl border border-dashed border-trooper-black/15 bg-trooper-tan/15">
                          <QrIcon
                            width={s.value === "small" ? 22 : s.value === "medium" ? 30 : 38}
                            height={s.value === "small" ? 22 : s.value === "medium" ? 30 : 38}
                            className="text-charcoal/35"
                          />
                        </div>
                      )}
                      <span className="px-1 pb-0.5">
                        <span className="block text-sm font-bold text-trooper-black">{s.label}</span>
                        <span className="block text-xs text-charcoal/60">{s.hint}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <Toggle
              labelPosition="side"
              label={`Print "${petName}" on the tag`}
              description="Adds your pet's name above the QR code."
              checked={options.includeName}
              onChange={(v) => update({ includeName: v })}
            />

            <FormField label="File format">
              <SelectInput
                options={FORMAT_OPTIONS}
                value={options.format}
                onChange={(v) => update({ format: v as TagFormat })}
                open={formatOpen}
                onOpenChange={setFormatOpen}
              />
            </FormField>
          </>
        )}
      </ModalBody>

      <ModalFooter>
        {generating ? (
          <>
            <Button variant="ghost" onClick={handleCancel} className="text-trooper-black">
              Cancel
            </Button>
            <Button disabled icon={<Spinner />} iconPosition="left">
              Generating…
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={handleClose} className="text-trooper-black">
              {done ? "Done" : "Close"}
            </Button>
            <Button onClick={handleGenerate} icon={<QrIcon />} iconPosition="left">
              {error ? "Try again" : "Generate tag"}
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
}
