import { apiFetch } from "../api/client";
import { LoginIdentifier, LoginRequest } from "../types/auth";

type NavigateFn = (path: string) => void;

export async function handleLogin(
  identifier: string,
  password: string,
  setError: (error: string | null) => void,
  navigate: NavigateFn,
) {
  setError(null);
  const loginIdentifier: LoginIdentifier = identifier.includes("@")
    ? { email: identifier }
    : { phone: identifier };

  const body: LoginRequest = { identifier: loginIdentifier, password };

  try {
    const res = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed");
      return;
    }
    navigate("/");
  } catch {
    setError("Network error. Please try again.");
  }
}

export async function handleLogout(navigate: NavigateFn) {
  try {
    const res = await apiFetch("/logout", {
      method: "GET",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("Logout failed:", data.error ?? "Unknown error");
    } else {
      navigate("/");
    }
  } catch {
    console.error("Logout failed");
  }
}
