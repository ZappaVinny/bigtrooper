import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import ButtonPrimaryWithIcon from "../components/ButtonPrimaryWithIcon";
import ButtonPrimary from "../components/ButtonPrimary";
import TextInput from "../components/TextInput";
import SelectInput from "../components/SelectInput";
import PhoneInput from "../components/PhoneInput";

import Modal from "../components/Modal";
import ModalHeader from "../components/ModalHeader";
import ModalBody from "../components/ModalBody";
import ModalFooter from "../components/ModalFooter";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";
import {
  UserUpdate,
  CommunicationPreference,
  ChangePassword,
} from "../types/api";

// import PawPrint from "../assets/paw-print.svg";

export default function Account() {
  const nav = useNavigate();
  const { user, loading, logout } = useAuth();

  const [firstName, setFirstName] = useState<string>(user?.first_name ?? "");
  const [lastName, setLastName] = useState<string>(user?.last_name ?? "");
  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [phone, setPhone] = useState<string>(user?.phone_number ?? "");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [passwordSuccess, setPasswordSuccess] = useState<string>("");
  const [emailNotification, setEmailNotification] = useState<boolean>(
    user?.preferences.email ?? false,
  );
  const [phoneNotification, setPhoneNotification] = useState<boolean>(
    user?.preferences.sms ?? false,
  );
  const [openDropdown, setOpenDropdown] = useState<"email" | "phone" | null>(
    null,
  );

  const notifOptions = [
    { label: "On", value: "true" },
    { label: "Off", value: "false" },
  ];

  async function handleUpdate() {
    const patchUser = async (patch: UserUpdate) => {
      try {
        const res = await apiFetch("/me", {
          method: "PATCH",
          body: JSON.stringify({ ...patch }),
        });
        if (!res.ok) {
          console.log("Bad");
          nav(0);
        }
      } catch (err) {
        console.log(err);
      }
    };

    const prefPatch: CommunicationPreference = {
      email: emailNotification,
      sms: phoneNotification,
    };

    const userPatch: UserUpdate = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phone,
      preferences: prefPatch,
    };
    patchUser(userPatch);
  }

  async function handleUpdatePassword() {
    const updatePassword = async (update: ChangePassword) => {
      try {
        const res = await apiFetch("/change-password", {
          method: "POST",
          body: JSON.stringify({ ...update }),
        });
        if (!res.ok) {
          setPasswordError("Failed To Change Password");
          return;
        }
        setPasswordSuccess("Password Changed Successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (err) {
        console.log(err);
        setPasswordError("Failed To Change Password");
      }
    };

    setPasswordSuccess("");
    setPasswordError("");

    if (currentPassword == "" || newPassword == "" || confirmPassword == "") {
      setPasswordError("Please Fill Out All Fields");
      return;
    } else if (!(newPassword == confirmPassword)) {
      setPasswordError("Passwords Do Not Match");
      return;
    }

    const PasswordUpdate: ChangePassword = {
      current_password: currentPassword,
      new_password: newPassword,
    };
    updatePassword(PasswordUpdate);
  }

  const PasswordModal = modalOpen && (
    <Modal onClose={() => setModalOpen(false)} className="bg-trooper-tan">
      <ModalHeader onClose={() => setModalOpen(false)}>
        Change Password
      </ModalHeader>
      <ModalBody>
        <div className="flex flex-col items-center">
          {passwordSuccess !== "" && (
            <span className="text-success">{passwordSuccess}</span>
          )}
          {passwordError !== "" && (
            <span className="text-danger">{passwordError}</span>
          )}
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
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e)}
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
            value={newPassword}
            onChange={(e) => setNewPassword(e)}
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e)}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="flex flex-1 flex-row justify-center">
          <ButtonPrimary
            className="bg-ear-pink w-100"
            onClick={handleUpdatePassword}
          >
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
          <TextInput
            placeholder="First Name"
            className="w-100"
            value={firstName}
            onChange={(e) => setFirstName(e)}
          />
        </div>
        <div className="flex flex-col items-center">
          <label htmlFor="last-name" className="text-[24px] text-trooper-black">
            Last Name
          </label>
          <TextInput
            placeholder="Last Name"
            className="w-100"
            value={lastName}
            onChange={(e) => setLastName(e)}
          />
        </div>
      </div>
      <div className="flex flex-row gap-5">
        <div className="flex flex-col items-center">
          <label className="text-[24px] text-trooper-black">
            Email Notifications
          </label>
          <SelectInput
            className="w-100"
            value={String(emailNotification)}
            onChange={(value) => setEmailNotification(value === "true")}
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
            value={String(phoneNotification)}
            onChange={(value) => setPhoneNotification(value === "true")}
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
          <TextInput
            placeholder="Email"
            className="w-100"
            value={email}
            onChange={(e) => setEmail(e)}
          />
        </div>
        <div className="flex flex-col items-center">
          <label htmlFor="phone" className="text-[24px] text-trooper-black">
            Phone Number
          </label>
          <PhoneInput
            placeholder="Phone Number"
            className="w-100"
            value={phone}
            onChange={(e) => setPhone(e)}
          />
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
          onClick={handleUpdate}
        >
          Save Changes
        </ButtonPrimary>
      </div>
    </div>
  );
}
