import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { apiFetch } from "../api/client";
import { normalizePhone } from "../lib/phone";
import { type User } from "../types/api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const req = apiFetch("/me");
    req
      .then((r) => {
        if (!r.ok) throw new Error("unauthenticated");
        return r.json();
      })
      .then((u: User) => { if (alive) setUser(u); })
      .catch(() => { if (alive) setUser(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; req.abort(); };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const loginIdentifier = identifier.includes("@")
      ? { email: identifier }
      : { phone: normalizePhone(identifier) };
    const res = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ identifier: loginIdentifier, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Login failed");
    }
    const loggedIn = (await res.json()).user;

    // The login response doesn't include `admin`, so load the full user from /me.
    const me = await apiFetch("/me");
    setUser(me.ok ? await me.json() : loggedIn);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await apiFetch("/logout", { method: "POST" });
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await apiFetch("/me");
    if (res.ok) setUser(await res.json());
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
