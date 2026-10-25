import { useEffect, useRef, useState } from "react";

import Modal from "./Modal";
import ModalHeader from "./ModalHeader";
import ModalBody from "./ModalBody";
import ModalFooter from "./ModalFooter";
import Button from "./Button";
import FormMessage from "./FormMessage";
import TrooperLoader from "./TrooperLoader";
import { DownloadIcon, ExternalLinkIcon, QrIcon } from "./icons";
import { cn } from "../lib/cn";
import { generateTags, listTags, type PetTag } from "../api/tags";

// Copy for each variant the server generates. A variant missing here still
// gets a download card, just without the summary.
const VARIANTS: Record<string, { label: string; format: string; summary: string; guideUrl: string }> = {
  color: {
    label: "Color",
    format: "3MF",
    summary:
      "Two-color tag for multi-material printers (AMS, MMU). The QR prints in black on a white base, no filament swap needed.",
    guideUrl: "#",
  },
  plain: {
    label: "Plain",
    format: "STL",
    summary:
      "Single-material tag that prints on any printer, with \"SCAN ME / IN LIGHT\" recessed on the back. For a two-tone look, add a filament change at the QR layer.",
    guideUrl: "#",
  },
};

// Shown in turn while the request is in flight so a slow response still
// reads as progress, not a frozen screen.
const PROGRESS_STEPS = [
  "Creating your QR code…",
  "Building the 3D models…",
  "Uploading your files…",
];

type Status = "loading" | "empty" | "generating" | "ready" | "error";

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
  const [status, setStatus] = useState<Status>("loading");
  const [tags, setTags] = useState<PetTag[]>([]);
  const [step, setStep] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // Check for existing tags when the modal opens.
  useEffect(() => {
    const controller = new AbortController();
    listTags(petId, controller.signal)
      .then((existing) => {
        setTags(existing);
        setStatus(existing.length > 0 ? "ready" : "empty");
      })
      .catch((err) => {
        if ((err as DOMException).name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, [petId]);

  // Cycle the status text while generating.
  useEffect(() => {
    if (status !== "generating") return;
    const timer = setInterval(
      () => setStep((s) => Math.min(s + 1, PROGRESS_STEPS.length - 1)),
      5000,
    );
    return () => clearInterval(timer);
  }, [status]);

  // Cancel any in-flight request if the modal unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  async function handleGenerate() {
    setStep(0);
    setStatus("generating");
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const generated = await generateTags(petId, controller.signal);
      setTags(generated);
      setStatus("ready");
    } catch (err) {
      if ((err as DOMException).name === "AbortError") return;
      setStatus("error");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("empty");
  }

  function handleClose() {
    abortRef.current?.abort();
    onClose();
  }

  let body;
  if (status === "loading") {
    body = (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8 text-trooper-amber" />
      </div>
    );
  } else if (status === "generating") {
    body = (
      <TrooperLoader
        title={`Generating ${petName}'s tag`}
        message={PROGRESS_STEPS[step]}
        hint="This can take up to a minute. Keep this window open."
      />
    );
  } else if (status === "ready") {
    body = (
      <div className="grid gap-3 sm:grid-cols-2">
        {tags.map((t) => {
          const info = VARIANTS[t.variant];
          return (
            <div
              key={t.variant}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-cream-50 p-4"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-bold text-trooper-black">{info?.label ?? t.variant}</h3>
                {info && <span className="text-xs font-semibold text-charcoal/55">{info.format}</span>}
              </div>
              {info && <p className="flex-1 text-sm text-charcoal/70">{info.summary}</p>}
              <Button href={t.url} icon={<DownloadIcon />} iconPosition="left" fullWidth>
                Download
              </Button>
              {info && (
                <a
                  href={info.guideUrl}
                  className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-trooper-black"
                >
                  How to print the {info.label.toLowerCase()} tag
                  <ExternalLinkIcon width={14} height={14} />
                </a>
              )}
            </div>
          );
        })}
      </div>
    );
  } else {
    body = (
      <div className="flex flex-col items-center gap-5 py-8 text-center">
        {status === "error" && (
          <FormMessage>Tag generation can't be completed at the moment. Please try again later.</FormMessage>
        )}
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-trooper-tan/20">
          <QrIcon width={30} height={30} className="text-trooper-black" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-display text-2xl text-trooper-black">No tag yet for {petName}</p>
          <p className="max-w-sm text-sm text-charcoal/70">
            The tag's QR code links to {petName}'s found page, so anyone who
            finds them can reach you.
          </p>
        </div>
        <Button size="lg" onClick={handleGenerate} icon={<QrIcon />} iconPosition="left">
          {status === "error" ? "Try again" : "Generate tag"}
        </Button>
      </div>
    );
  }

  return (
    <Modal onClose={handleClose} labelledBy="tag-modal-title" className="max-w-xl">
      <ModalHeader id="tag-modal-title" onClose={handleClose}>
        Tag for {petName}
      </ModalHeader>

      <ModalBody>{body}</ModalBody>

      <ModalFooter>
        {status === "generating" ? (
          <Button variant="ghost" onClick={handleCancel} className="text-trooper-black">
            Cancel
          </Button>
        ) : (
          <Button variant="ghost" onClick={handleClose} className="text-trooper-black">
            {status === "ready" ? "Done" : "Close"}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
