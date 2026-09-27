import { useEffect, useState, type SyntheticEvent } from "react";
import { useParams } from "react-router-dom";

import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Button from "../components/Button";
import FormField from "../components/FormField";
import FormMessage from "../components/FormMessage";
import TextInput from "../components/TextInput";
import PhoneInput from "../components/PhoneInput";
import Checkbox from "../components/Checkbox";
import { CheckIcon, PawIcon } from "../components/icons";
import DefaultPet from "../assets/default-pet.svg";
import {
  FoundPetNotFoundError,
  getFoundPet,
  reportFound,
  type FoundPet,
  type FoundReport,
} from "../api/found";

function formatAge(age: number) {
  if (age < 1) return "Under 1 year old";
  return `${age} ${age === 1 ? "year" : "years"} old`;
}

// Only a general area is shared: rounding to 2 decimals is roughly 1 km.
const roughly = (n: number) => Math.round(n * 100) / 100;

type LocationState =
  | { status: "off" }
  | { status: "locating" }
  | { status: "on"; lat: number; lng: number }
  | { status: "denied" };

function PetProfile({ pet }: { pet: FoundPet }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-4/3 overflow-hidden bg-trooper-tan/30">
        {pet.image_url ? (
          <img src={pet.image_url} alt={pet.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <img src={DefaultPet} alt="" className="h-20 w-20 opacity-30" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-trooper-black/80 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-cream backdrop-blur">
          Lost pet
        </span>
      </div>
      <div className="flex flex-col gap-3 p-6">
        <div>
          <h2 className="text-3xl text-trooper-black">{pet.name}</h2>
          <p className="text-sm font-semibold text-charcoal/60">
            {pet.type} · {formatAge(pet.age)}
          </p>
        </div>
        {pet.description && (
          <p className="leading-relaxed text-charcoal/80">{pet.description}</p>
        )}
      </div>
    </Card>
  );
}

function ReportForm({ code, pet, onDone }: { code: string; pet: FoundPet; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<LocationState>({ status: "off" });
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleLocation(checked: boolean) {
    if (!checked) return setLocation({ status: "off" });
    if (!("geolocation" in navigator)) return setLocation({ status: "denied" });
    setLocation({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          status: "on",
          lat: roughly(pos.coords.latitude),
          lng: roughly(pos.coords.longitude),
        }),
      () => setLocation({ status: "denied" }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");

    const next: typeof errors = {};
    if (!email && !phone) {
      next.email = "Add an email or phone number so the owner can reach you.";
    } else {
      if (email && !/\S+@\S+\.\S+/.test(email)) next.email = "Enter a valid email address.";
      if (phone && phone.length !== 12) next.phone = "Enter a 10-digit phone number.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const report: FoundReport = {
      email: email || null,
      phone_number: phone || null,
      location: location.status === "on" ? { lat: location.lat, lng: location.lng } : null,
    };

    setSubmitting(true);
    try {
      await reportFound(code, report);
      onDone();
    } catch (err) {
      console.error(err);
      setSubmitError("We couldn't send your report. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const locationNote =
    location.status === "locating"
      ? "Getting your location…"
      : location.status === "on"
        ? "Your approximate area (about 1 km) will be shared."
        : location.status === "denied"
          ? "Location isn't available. You can still report without it."
          : "Helps the owner know where to look. Only a general area is shared.";

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div>
          <h2 className="text-3xl text-trooper-black">Let {pet.name}'s owner know</h2>
          <p className="mt-1 text-sm text-charcoal/65">
            Add at least one way for them to reach you.
          </p>
        </div>

        {submitError && <FormMessage>{submitError}</FormMessage>}

        <FormField label="Email" error={errors.email}>
          <TextInput
            inputType="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
          />
        </FormField>
        <FormField label="Phone number" error={errors.phone}>
          <PhoneInput value={phone} onChange={setPhone} />
        </FormField>

        <Checkbox
          label="Share my general location"
          description={locationNote}
          checked={location.status === "on" || location.status === "locating"}
          disabled={location.status === "locating"}
          onChange={toggleLocation}
          className="rounded-xl border border-line bg-cream/50 p-4"
        />

        <p className="text-xs leading-relaxed text-charcoal/60">
          By submitting, your contact information{location.status === "on" && " and general location"}{" "}
          may be given to {pet.name}'s owner so they can reach out to you.
        </p>

        <Button
          type="submit"
          size="lg"
          fullWidth
          icon={<PawIcon />}
          disabled={submitting || location.status === "locating"}
        >
          {submitting ? "Sending…" : "Report Found"}
        </Button>
      </form>
    </Card>
  );
}

export default function Found() {
  const { code = "" } = useParams<{ code: string }>();
  const [pet, setPet] = useState<FoundPet | null>(null);
  const [failure, setFailure] = useState<"not-found" | "error" | null>(null);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    let alive = true;
    getFoundPet(code)
      .then((p) => alive && setPet(p))
      .catch((err) => {
        if (alive) setFailure(err instanceof FoundPetNotFoundError ? "not-found" : "error");
      });
    return () => {
      alive = false;
    };
  }, [code]);

  if (failure) {
    return (
      <PageShell
        title={failure === "not-found" ? "Tag not active" : "Something went wrong"}
        width="sm"
        center
      >
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-charcoal/70">
            {failure === "not-found"
              ? "We couldn't find an active pet for this tag. The owner may have paused it, or the code may be mistyped."
              : "We couldn't load this pet right now. Please try scanning the tag again in a moment."}
          </p>
        </Card>
      </PageShell>
    );
  }

  if (!pet) {
    return (
      <PageShell width="lg">
        <div className="flex animate-pulse flex-col gap-8">
          <div className="mx-auto h-12 w-2/3 max-w-md rounded-full bg-trooper-black/10" />
          <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-2 lg:gap-8">
            <div className="aspect-4/3 rounded-2xl bg-trooper-tan/25" />
            <div className="h-96 rounded-2xl border border-line bg-cream-50" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (reported) {
    return (
      <PageShell width="sm" center>
        <Card className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
            <CheckIcon width={28} height={28} strokeWidth={2.5} />
          </span>
          <h1 className="text-4xl text-trooper-black">Thank you!</h1>
          <p className="max-w-sm leading-relaxed text-charcoal/75">
            {pet.name}'s owner has been notified and may reach out to you soon.
            If you can, keep {pet.name} somewhere safe until they do.
          </p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`You found ${pet.name}!`}
      subtitle="Thank you for stopping to help. Let their owner know they're safe."
      width="lg"
    >
      {/* Stacked on phones; side by side on desktop, with the pet kept in view. */}
      <div className="mx-auto grid w-full max-w-md grid-cols-1 items-start gap-6 lg:max-w-none lg:grid-cols-2 lg:gap-8">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <PetProfile pet={pet} />
        </div>
        <ReportForm code={code} pet={pet} onDone={() => setReported(true)} />
      </div>
    </PageShell>
  );
}
