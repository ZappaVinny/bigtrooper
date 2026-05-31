import { useState } from "react";
// import ButtonPrimaryWithIcon from "../components/ButtonPrimaryWithIcon";
import ButtonPrimary from "../components/ButtonPrimary";
import TextInput from "../components/TextInput";
import SelectInput from "../components/SelectInput";

import Modal from "../components/Modal";
import ModalHeader from "../components/ModalHeader";
import ModalBody from "../components/ModalBody";
import ModalFooter from "../components/ModalFooter";

// import PawPrint from "../assets/paw-print.svg";

export default function Account() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [emailNotification, setEmailNotification] = useState("");
  const [phoneNotification, setPhoneNotification] = useState("");
  const [openDropdown, setOpenDropdown] = useState<"email" | "phone" | null>(
    null,
  );

  const notifOptions = [
    { label: "On", value: "on" },
    { label: "Off", value: "off" },
  ];

  const PasswordModal = modalOpen && (
    <Modal onClose={() => setModalOpen(false)} className="bg-trooper-tan">
      <ModalHeader onClose={() => setModalOpen(false)}>
        Change Password
      </ModalHeader>
      <ModalBody>
        <div className="flex flex-col items-center">
          <label
            htmlFor="current-password"
            className="text-[24px] text-trooper-black"
          >
            Current Password
          </label>
          <TextInput
            placeholder="Current Password"
            inputType="password"
            className="w-100"
          />
        </div>
        <div className="flex flex-col items-center">
          <label
            htmlFor="new-password"
            className="text-[24px] text-trooper-black"
          >
            New Password
          </label>
          <TextInput
            placeholder="New Password"
            inputType="password"
            className="w-100"
          />
        </div>
        <div className="flex flex-col items-center">
          <label
            htmlFor="confirm-new-password"
            className="text-[24px] text-trooper-black"
          >
            Confirm New Password
          </label>
          <TextInput
            placeholder="Confirm New Password"
            inputType="password"
            className="w-100"
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="flex flex-1 flex-row justify-center">
          <ButtonPrimary className="bg-ear-pink w-100">
            {" "}
            Confirm Password Change
          </ButtonPrimary>
        </div>
      </ModalFooter>
    </Modal>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] items-center justify-center gap-3">
      {PasswordModal}
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-trooper-black">Edit Account</h1>
        <p className="text-[16px] text-trooper-black">
          Make edits to your BigTrooper account
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
          <TextInput placeholder="First Name" className="w-100" />
        </div>
        <div className="flex flex-col items-center">
          <label htmlFor="last-name" className="text-[24px] text-trooper-black">
            Last Name
          </label>
          <TextInput placeholder="Last Name" className="w-100" />
        </div>
      </div>
      <div className="flex flex-row gap-5">
        <div className="flex flex-col items-center">
          <label className="text-[24px] text-trooper-black">
            Email Notifications
          </label>
          <SelectInput
            className="w-100"
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
            className="w-100"
            value={phoneNotification}
            onChange={setPhoneNotification}
            placeholder="Select"
            options={notifOptions}
            open={openDropdown === "phone"}
            onOpenChange={(next) => setOpenDropdown(next ? "phone" : null)}
          />
        </div>
      </div>
      <div className="flex flex-row gap-5">
        <div className="flex flex-col items-center">
          <label htmlFor="email" className="text-[24px] text-trooper-black">
            Email
          </label>
          <TextInput placeholder="Email" className="w-100" />
        </div>
        <div className="flex flex-col items-center">
          <label htmlFor="phone" className="text-[24px] text-trooper-black">
            Phone Number
          </label>
          <TextInput placeholder="Phone Number" className="w-100" />
        </div>
      </div>
      <div className="flex flex-col items-center mt-3 gap-6">
        <ButtonPrimary
          onClick={() => setModalOpen(true)}
          className="
            h-12
            w-205
            bg-transparent
            border-[3px]
            border-trooper-black
          "
        >
          Change Password
        </ButtonPrimary>

        <ButtonPrimary
          className="
            h-12
            w-205
            bg-trooper-tan
            border-[3px]
            border-trooper-black
          "
        >
          Save Changes
        </ButtonPrimary>
      </div>
    </div>
  );
}
