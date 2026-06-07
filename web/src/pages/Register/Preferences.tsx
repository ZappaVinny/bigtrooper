import { useState } from "react";
import ButtonPrimaryWithIcon from "../../components/ButtonPrimaryWithIcon";
import TextInput from "../../components/TextInput";
import SelectInput from "../../components/SelectInput";

import PawPrint from "../../assets/paw-print.svg";
import ButtonPrimary from "../../components/ButtonPrimary";
import { RegisterRequest, CommunicationPreference } from "../../types/api";

export default function Preferences({
  value,
  onChange,
  notifications,
  onNotificationsChange,
  onSubmit,
  onBack,
}: {
  value: RegisterRequest;
  onChange: (patch: Partial<RegisterRequest>) => void;
  notifications: CommunicationPreference;
  onNotificationsChange: (patch: Partial<CommunicationPreference>) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const [openDropdown, setOpenDropdown] = useState<"email" | "phone" | null>(
    null,
  );

  const notifOptions = [
    { label: "On", value: "on" },
    { label: "Off", value: "off" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] items-center justify-center gap-3">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-trooper-black">Preferences</h1>
        <p className="text-[16px] text-trooper-black">
          Please Provide additional details
        </p>
      </div>

      <div className="flex flex-row gap-5">
        <div className="flex flex-col items-center">
          <label
            htmlFor="first-name"
            className="text-[24px] text-trooper-black"
          >
            First Name
          </label>
          <TextInput
            value={value.first_name}
            onChange={(v) => onChange({ first_name: v })}
            placeholder="First Name"
            className="w-55"
          />
        </div>
        <div className="flex flex-col items-center">
          <label htmlFor="last-name" className="text-[24px] text-trooper-black">
            Last Name
          </label>
          <TextInput
            value={value.last_name}
            onChange={(v) => onChange({ last_name: v })}
            placeholder="Last Name"
            className="w-55"
          />
        </div>
      </div>

      <div className="flex flex-row gap-5">
        <div className="flex flex-col items-center">
          <label className="text-[24px] text-trooper-black">
            Email Notifications
          </label>
          <SelectInput
            className="w-55"
            value={notifications.email ? "on" : "off"}
            onChange={(v) => onNotificationsChange({ email: v === "on" })}
            placeholder="Select"
            options={notifOptions}
            open={openDropdown === "email"}
            onOpenChange={(next) => setOpenDropdown(next ? "email" : null)}
          />
        </div>

        <div className="flex flex-col items-center">
          <label className="text-[24px] text-trooper-black">
            Phone Notifications
          </label>
          <SelectInput
            className="w-55"
            value={notifications.sms ? "on" : "off"}
            onChange={(v) => onNotificationsChange({ sms: v === "on" })}
            placeholder="Select"
            options={notifOptions}
            open={openDropdown === "phone"}
            onOpenChange={(next) => setOpenDropdown(next ? "phone" : null)}
          />
        </div>
      </div>

      <div className="flex flex-row items-center mt-3 gap-5">
        <ButtonPrimary
          onClick={onBack}
          className="
          h-12
          w-55
          bg-trooper-black
          border-[3px]
          border-trooper-tan
          "
        >
          <span className="text-trooper-tan">Go Back</span>
        </ButtonPrimary>
        <ButtonPrimaryWithIcon
          onClick={onSubmit}
          className="
              h-12
              w-55
              bg-trooper-tan
              border-[3px]
              border-trooper-black
            "
          icon={PawPrint}
        >
          Create Account
        </ButtonPrimaryWithIcon>
      </div>
    </div>
  );
}
