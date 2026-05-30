import { useState } from "react";
import ButtonPrimaryWithIcon from "../../components/ButtonPrimaryWithIcon";
import TextInput from "../../components/TextInput";
import SelectInput from "../../components/SelectInput";

import PawPrint from "../../assets/paw-print.svg";

export default function Preferences({ onSubmit }: { onSubmit: () => void }) {
  const [emailNotification, setEmailNotification] = useState("");
  const [phoneNotification, setPhoneNotification] = useState("");
  const [openDropdown, setOpenDropdown] = useState<"email" | "phone" | null>(null);

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
          <label htmlFor="first-name" className="text-[24px] text-trooper-black">
            First Name
          </label>
          <TextInput placeholder="First Name" length="w-[220px]" />
        </div>
        <div className="flex flex-col items-center">
          <label htmlFor="last-name" className="text-[24px] text-trooper-black">
            Last Name
          </label>  
          <TextInput placeholder="Last Name" length="w-[220px]" />
        </div>
      </div>

      <div className="flex flex-row gap-5">
        <div className="flex flex-col items-center">
          <label className="text-[24px] text-trooper-black">
            Email Notifications
          </label>
          <SelectInput
            length="w-[220px]"
            value={emailNotification}
            onChange={setEmailNotification}
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
            length="w-[220px]"
            value={phoneNotification}
            onChange={setPhoneNotification}
            placeholder="Select"
            options={notifOptions}
            open={openDropdown === "phone"}
            onOpenChange={(next) => setOpenDropdown(next ? "phone" : null)}
          />
        </div>
      </div>

      <div className="flex flex-col items-center mt-3">
        <ButtonPrimaryWithIcon
          onClick={onSubmit}
          height="h-12"
          length="w-[400px]"
          bgcolor="bg-trooper-tan"
          bordercolor="border-trooper-black"
          icon={PawPrint}
        >
          Create Account
        </ButtonPrimaryWithIcon>
      </div>
    </div>
  );
}
