import { useState, type ReactNode, type SyntheticEvent } from "react";

import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Button from "../components/Button";
import FormField from "../components/FormField";
import FormMessage from "../components/FormMessage";
import TextInput from "../components/TextInput";
import PhoneInput from "../components/PhoneInput";
import Toggle from "../components/Toggle";
import Modal from "../components/Modal";
import ModalHeader from "../components/ModalHeader";
import ModalBody from "../components/ModalBody";
import ModalFooter from "../components/ModalFooter";
import { BellIcon, LockIcon, UserIcon } from "../components/icons";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";
import { UserUpdate, ChangePassword } from "../types/api";

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-trooper-tan/35 text-trooper-amber [&>svg]:h-4.5 [&>svg]:w-4.5">
          {icon}
        </span>
        <div>
          <h2 className="text-2xl text-trooper-black">{title}</h2>
          <p className="text-sm text-charcoal/60">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    const update: ChangePassword = {
      current_password: currentPassword,
      new_password: newPassword,
    };
    setSubmitting(true);
    try {
      const res = await apiFetch("/change-password", {
        method: "POST",
        body: JSON.stringify(update),
      });
      if (!res.ok) {
        setError(
          res.status === 401
            ? "Your current password is incorrect."
            : "We couldn't change your password. Please try again.",
        );
        return;
      }
      setSuccess("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError("We couldn't change your password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} labelledBy="change-password-title">
      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-col">
        <ModalHeader id="change-password-title" onClose={onClose}>
          Change password
        </ModalHeader>
        <ModalBody>
          {success && <FormMessage tone="success">{success}</FormMessage>}
          {error && <FormMessage>{error}</FormMessage>}
          <FormField label="Current password">
            <TextInput
              inputType="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={setCurrentPassword}
            />
          </FormField>
          <FormField label="New password" hint="At least 6 characters.">
            <TextInput
              inputType="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={setNewPassword}
            />
          </FormField>
          <FormField label="Confirm new password">
            <TextInput
              inputType="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} className="text-trooper-black">
            {success ? "Done" : "Cancel"}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Update password"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default function Account() {
  const { user, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const [emailNotification, setEmailNotification] = useState(
    user?.preferences.email ?? false,
  );
  const [phoneNotification, setPhoneNotification] = useState(
    user?.preferences.sms ?? false,
  );
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function handleSave(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);

    if (!firstName.trim() || !lastName.trim()) {
      setStatus({ tone: "error", text: "First and last name are required." });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setStatus({ tone: "error", text: "Enter a valid email address." });
      return;
    }

    const patch: UserUpdate = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phone,
      preferences: { email: emailNotification, sms: phoneNotification },
    };

    setSaving(true);
    try {
      const res = await apiFetch("/me", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg: string = data.error ?? "We couldn't save your changes.";
        setStatus({ tone: "error", text: msg.charAt(0).toUpperCase() + msg.slice(1) + "." });
        return;
      }
      await refreshUser();
      setStatus({ tone: "success", text: "Your changes have been saved." });
    } catch (err) {
      console.error(err);
      setStatus({ tone: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      title="Account settings"
      subtitle="Manage your details and how finders reach you"
      width="md"
    >
      {passwordOpen && <ChangePasswordModal onClose={() => setPasswordOpen(false)} />}

      <form onSubmit={handleSave} noValidate className="flex flex-col gap-6">
        <Section
          icon={<UserIcon />}
          title="Profile"
          description="Shown to whoever scans your pet's tag, based on your preferences."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="First name">
              <TextInput autoComplete="given-name" value={firstName} onChange={setFirstName} />
            </FormField>
            <FormField label="Last name">
              <TextInput autoComplete="family-name" value={lastName} onChange={setLastName} />
            </FormField>
            <FormField label="Email">
              <TextInput inputType="email" autoComplete="email" value={email} onChange={setEmail} />
            </FormField>
            <FormField label="Phone">
              <PhoneInput value={phone} onChange={setPhone} />
            </FormField>
          </div>
        </Section>

        <Section
          icon={<BellIcon />}
          title="Notifications"
          description="How we alert you when one of your pet's tags is scanned."
        >
          <div className="flex flex-col divide-y divide-line">
            <Toggle
              labelPosition="side"
              label="Email alerts"
              description={email || undefined}
              checked={emailNotification}
              onChange={setEmailNotification}
              className="pb-4"
            />
            <Toggle
              labelPosition="side"
              label="Text message alerts"
              description="Standard messaging rates may apply."
              checked={phoneNotification}
              onChange={setPhoneNotification}
              className="pt-4"
            />
          </div>
        </Section>

        {status && <FormMessage tone={status.tone}>{status.text}</FormMessage>}

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <Section
        icon={<LockIcon />}
        title="Security"
        description="Keep your account safe with a strong password."
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-charcoal">Password</p>
            <p className="text-sm text-charcoal/60">Change the password you use to log in.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setPasswordOpen(true)}
            className="text-trooper-black"
          >
            Change password
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
