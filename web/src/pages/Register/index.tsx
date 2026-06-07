import { useState } from "react";
import AccountDetails from "./AccountDetails";
import Preferences from "./Preferences";
import { RegisterRequest, CommunicationPreference } from "../../types/api";
import { apiFetch } from "../../api/client";

export default function RegisterPage() {
  const [Signup, setSignup] = useState<RegisterRequest>({
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
  const [step, setStep] = useState<"details" | "preferences">("details");

  function updateSignup(patch: Partial<RegisterRequest>) {
    setSignup((prev) => ({ ...prev, ...patch }));
  }

  function updateNotifications(patch: Partial<CommunicationPreference>) {
    setNotifications((prev) => ({ ...prev, ...patch }));
  }

  function validateSignup(Signup: RegisterRequest) {
    const { first_name, last_name, email, phone_number, password } = Signup;
    if (!first_name || !last_name || !email || !phone_number || !password) {
      return false;
    }
    if (
      first_name === "" ||
      last_name === "" ||
      email === "" ||
      phone_number === "" ||
      password === ""
    ) {
      return "Please fill in all fields.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (first_name.length > 50 || last_name.length > 50) {
      return "Names must be no longer than 50 characters.";
    }
    if (email.length > 100) {
      return "Email must be no longer than 100 characters.";
    }
    return true;
  }

  function createUser() {
    var validate = validateSignup(Signup);
    if (!validateSignup(Signup)) {
      alert(validate);
      return;
    } else {
      var promise = apiFetch("/signup", {
        method: "POST",
        body: JSON.stringify({
          ...Signup,
          preferences: notifications,
        }),
      });

      promise
        .then((response) => {
          if (response.ok) {
            alert("User created successfully!");
            // Optionally, redirect to login page or home page
          } else {
            alert("Failed to create user. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error creating user:", error);
          alert("An error occurred. Please try again.");
        });
    }
    console.log("Creating user with:", Signup, notifications);
  }

  function handleBack() {
    setStep("details");
  }

  function handleNext() {
    setStep("preferences");
  }

  if (step === "preferences") {
    return (
      <Preferences
        value={Signup}
        onChange={updateSignup}
        notifications={notifications}
        onNotificationsChange={updateNotifications}
        onSubmit={createUser}
        onBack={handleBack}
      />
    );
  }

  return (
    <AccountDetails
      value={Signup}
      onChange={updateSignup}
      onNext={handleNext}
    />
  );
}
