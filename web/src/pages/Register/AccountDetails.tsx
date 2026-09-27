import { useState, type SyntheticEvent } from "react";

import FormField from "../../components/FormField";
import TextInput from "../../components/TextInput";
import PhoneInput from "../../components/PhoneInput";
import Button from "../../components/Button";
import { ArrowRightIcon } from "../../components/icons";
import { RegisterRequest } from "../../types/api";

type Errors = Partial<Record<"email" | "phone" | "password" | "confirm", string>>;

function validate(value: RegisterRequest, confirmPassword: string): Errors {
  const errors: Errors = {};
  if (!value.email) errors.email = "Email is required.";
  else if (!/\S+@\S+\.\S+/.test(value.email)) errors.email = "Enter a valid email address.";
  else if (value.email.length > 100) errors.email = "Email must be 100 characters or fewer.";
  if (value.phone_number.length !== 12) errors.phone = "Enter a 10-digit phone number.";
  if (value.password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (value.password !== confirmPassword) errors.confirm = "Passwords don't match.";
  return errors;
}

export default function AccountDetails({
  value,
  onChange,
  onNext,
}: {
  value: RegisterRequest;
  onChange: (patch: Partial<RegisterRequest>) => void;
  onNext: () => void;
}) {
  const [confirmPassword, setConfirmPassword] = useState(value.password);
  const [errors, setErrors] = useState<Errors>({});

  function handleNext(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = validate(value, confirmPassword);
    setErrors(next);
    if (Object.keys(next).length === 0) onNext();
  }

  return (
    <form onSubmit={handleNext} noValidate className="flex flex-col gap-5">
      <FormField label="Email" error={errors.email}>
        <TextInput
          inputType="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={value.email}
          onChange={(v) => onChange({ email: v })}
        />
      </FormField>
      <FormField
        label="Phone"
        hint="Finders can reach you here if you turn on text alerts."
        error={errors.phone}
      >
        <PhoneInput
          value={value.phone_number}
          onChange={(v) => onChange({ phone_number: v })}
        />
      </FormField>
      <FormField label="Password" hint="At least 8 characters." error={errors.password}>
        <TextInput
          inputType="password"
          autoComplete="new-password"
          value={value.password}
          onChange={(v) => onChange({ password: v })}
        />
      </FormField>
      <FormField label="Confirm password" error={errors.confirm}>
        <TextInput
          inputType="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </FormField>

      <Button type="submit" size="lg" fullWidth icon={<ArrowRightIcon />} className="mt-2">
        Continue
      </Button>
    </form>
  );
}
