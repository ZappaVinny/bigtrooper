import { useState, type SyntheticEvent } from "react";

import FormField from "../../components/FormField";
import FormMessage from "../../components/FormMessage";
import TextInput from "../../components/TextInput";
import Toggle from "../../components/Toggle";
import Button from "../../components/Button";
import PawPrint from "../../assets/paw-print.svg";
import { RegisterRequest, CommunicationPreference } from "../../types/api";

type Errors = Partial<Record<"first" | "last", string>>;

function validate(value: RegisterRequest): Errors {
  const errors: Errors = {};
  if (!value.first_name.trim()) errors.first = "First name is required.";
  else if (value.first_name.length > 50) errors.first = "50 characters max.";
  if (!value.last_name.trim()) errors.last = "Last name is required.";
  else if (value.last_name.length > 50) errors.last = "50 characters max.";
  return errors;
}

export default function Preferences({
  value,
  onChange,
  notifications,
  onNotificationsChange,
  onSubmit,
  onBack,
  submitting,
  error,
}: {
  value: RegisterRequest;
  onChange: (patch: Partial<RegisterRequest>) => void;
  notifications: CommunicationPreference;
  onNotificationsChange: (patch: Partial<CommunicationPreference>) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
  error: string;
}) {
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate(value);
    setErrors(next);
    if (Object.keys(next).length === 0) onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {error && <FormMessage>{error}</FormMessage>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="First name" error={errors.first}>
          <TextInput
            autoComplete="given-name"
            value={value.first_name}
            onChange={(v) => onChange({ first_name: v })}
          />
        </FormField>
        <FormField label="Last name" error={errors.last}>
          <TextInput
            autoComplete="family-name"
            value={value.last_name}
            onChange={(v) => onChange({ last_name: v })}
          />
        </FormField>
      </div>

      <fieldset className="flex flex-col gap-4 rounded-xl border border-line bg-cream/50 p-4">
        <legend className="px-1 text-sm font-semibold text-charcoal">
          When your pet's tag is scanned, notify me by
        </legend>
        <Toggle
          labelPosition="side"
          label="Email"
          description={value.email || undefined}
          checked={notifications.email}
          onChange={(v) => onNotificationsChange({ email: v })}
        />
        <Toggle
          labelPosition="side"
          label="Text message"
          description="Standard messaging rates may apply."
          checked={notifications.sms}
          onChange={(v) => onNotificationsChange({ sms: v })}
        />
      </fieldset>

      <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row">
        <Button variant="outline" size="lg" onClick={onBack} className="text-trooper-black sm:w-auto">
          Back
        </Button>
        <Button type="submit" size="lg" icon={PawPrint} disabled={submitting} className="flex-1">
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </div>
    </form>
  );
}
