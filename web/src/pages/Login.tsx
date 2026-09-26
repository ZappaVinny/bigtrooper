import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import PageShell from "../components/PageShell";
import Card from "../components/Card";
import FormField from "../components/FormField";
import FormMessage from "../components/FormMessage";
import TextInput from "../components/TextInput";
import Button from "../components/Button";

import PawPrint from "../assets/paw-print.svg";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(identifier, password);
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ??
        "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      title="Welcome back"
      subtitle="Log in to your BigTrooper account"
      width="sm"
      center
    >
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {error && <FormMessage>{error}</FormMessage>}

          <FormField label="Email or phone">
            <TextInput
              placeholder="you@example.com"
              autoComplete="username"
              value={identifier}
              onChange={setIdentifier}
            />
          </FormField>

          <FormField label="Password">
            <TextInput
              inputType="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
            />
          </FormField>

          <Button
            type="submit"
            size="lg"
            fullWidth
            icon={PawPrint}
            disabled={submitting}
            className="mt-2"
          >
            {submitting ? "Logging in…" : "Log in"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-charcoal/70">
        New here? <Link to="/register" className="link">Create an account</Link>
      </p>
    </PageShell>
  );
}
