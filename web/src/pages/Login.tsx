import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import TextInput from "../components/TextInput";
import ButtonPrimaryWithIcon from "../components/ButtonPrimaryWithIcon";

import PawPrint from "../assets/paw-print.svg";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    try {
      await login(identifier, password);
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] items-center justify-center gap-3">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-trooper-black">Login</h1>
        <p className="text-[16px] text-trooper-black">
          Login to your BigTrooper account
        </p>
      </div>
      <div className="flex flex-col items-center">
        <label htmlFor="email" className="text-[24px] text-trooper-black">
          Email/Phone
        </label>
        <TextInput
          placeholder="Email or Phone Number"
          className="w-100"
          value={identifier}
          onChange={setIdentifier}
        />
      </div>
      <div className="flex flex-col items-center">
        <label htmlFor="Password" className="text-[24px] text-trooper-black">
          Password
        </label>
        <TextInput
          placeholder="Password"
          inputType="password"
          className="w-100"
          value={password}
          onChange={setPassword}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex flex-col items-center mt-3">
        <ButtonPrimaryWithIcon
          onClick={handleLogin}
          className="
            h-12
            w-100
            bg-trooper-tan
            border-[3px]
            border-trooper-black
          "
          icon={PawPrint}
        >
          Log In
        </ButtonPrimaryWithIcon>
      </div>
    </div>
  );
}
