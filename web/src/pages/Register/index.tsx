import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AccountDetails from "./AccountDetails";
import Preferences from "./Preferences";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import { RegisterRequest, CommunicationPreference } from "../../types/api";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { cn } from "../../lib/cn";

const STEPS = ["Account details", "About you"] as const;

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [signup, setSignup] = useState<RegisterRequest>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
  });
  const [notifications, setNotifications] = useState<CommunicationPreference>({
    email: true,
    sms: true,
  });
  const [step, setStep] = useState<0 | 1>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function updateSignup(patch: Partial<RegisterRequest>) {
    setSignup((prev) => ({ ...prev, ...patch }));
  }

  function updateNotifications(patch: Partial<CommunicationPreference>) {
    setNotifications((prev) => ({ ...prev, ...patch }));
  }

  async function createUser() {
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await apiFetch("/signup", {
        method: "POST",
        body: JSON.stringify({ ...signup, preferences: notifications }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error ?? "We couldn't create your account. Please try again.");
        return;
      }
      await login(signup.email, signup.password);
      navigate("/pets", { replace: true });
    } catch (err) {
      console.error("Error creating user:", err);
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      title="Create your account"
      subtitle="Set up BigTrooper in under a minute"
      width="sm"
      center
    >
      <Card className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-trooper-amber" : "bg-line",
                )}
              />
            ))}
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-charcoal/60">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </p>
        </div>

        {step === 0 ? (
          <AccountDetails
            value={signup}
            onChange={updateSignup}
            onNext={() => setStep(1)}
          />
        ) : (
          <Preferences
            value={signup}
            onChange={updateSignup}
            notifications={notifications}
            onNotificationsChange={updateNotifications}
            onSubmit={createUser}
            onBack={() => setStep(0)}
            submitting={submitting}
            error={submitError}
          />
        )}
      </Card>

      <p className="text-center text-sm text-charcoal/70">
        Already have an account? <Link to="/login" className="link">Log in</Link>
      </p>
    </PageShell>
  );
}
