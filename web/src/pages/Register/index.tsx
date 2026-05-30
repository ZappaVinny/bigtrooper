import { useState } from "react";
import AccountDetails from "./AccountDetails";
import Preferences from "./Preferences";

export default function RegisterPage() {
  const [step, setStep] = useState<"details" | "preferences">("details");

  if (step === "preferences") {
    return <Preferences onSubmit={() => {}} />;
  }

  return <AccountDetails onNext={() => setStep("preferences")} />;
}
