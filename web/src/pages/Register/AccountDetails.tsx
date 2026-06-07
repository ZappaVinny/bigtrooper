import { useState } from "react";

import TextInput from "../../components/TextInput";
import ButtonPrimaryWithIcon from "../../components/ButtonPrimaryWithIcon";

import PawPrint from "../../assets/paw-print.svg";
import PhoneInput from "../../components/PhoneInput";
import { RegisterRequest } from "../../types/api";

export default function AccountDetails({
  value,
  onChange,
  onNext,
}: {
  value: RegisterRequest;
  onChange: (patch: Partial<RegisterRequest>) => void;
  onNext: () => void;
}) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleNext() {
    if (value.password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    onNext();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] items-center justify-center gap-3">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-trooper-black">Register</h1>
        <p className="text-[16px] text-trooper-black">
          Register for a brand new account
        </p>
      </div>

      <div className="flex flex-col items-center">
        <label htmlFor="email" className="text-[24px] text-trooper-black">
          Email
        </label>
        <TextInput
          value={value.email}
          onChange={(v) => onChange({ email: v })}
          placeholder="Email"
          className="w-100"
        />
      </div>
      <div className="flex flex-col items-center">
        <label htmlFor="phone" className="text-[24px] text-trooper-black">
          Phone
        </label>
        <PhoneInput
          value={value.phone_number}
          onChange={(v) => onChange({ phone_number: v })}
          placeholder="Phone"
          className="w-100"
        />
      </div>
      <div className="flex flex-col items-center">
        <label htmlFor="Password" className="text-[24px] text-trooper-black">
          Password
        </label>
        <TextInput
          value={value.password}
          onChange={(v) => onChange({ password: v })}
          placeholder="Password"
          inputType="password"
          className="w-100"
        />
      </div>
      <div className="flex flex-col items-center">
        <label
          htmlFor="confirmPassword"
          className="text-[24px] text-trooper-black"
        >
          Confirm Password
        </label>
        <TextInput
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm Password"
          inputType="password"
          className="w-100"
        />
      </div>

      {error && <p className="text-red-600 text-[16px]">{error}</p>}

      <div className="flex flex-col items-center mt-3">
        <ButtonPrimaryWithIcon
          onClick={handleNext}
          className="
            h-12
            w-100
            bg-trooper-tan
            border-[3px]
            border-trooper-black
          "
          icon={PawPrint}
        >
          Next
        </ButtonPrimaryWithIcon>
      </div>
    </div>
  );
}
