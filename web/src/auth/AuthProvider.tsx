import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { apiFetch } from "../api/client";
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
      : { phone: identifier };
    const res = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ identifier: loginIdentifier, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Login failed");
    }
    setUser((await res.json()).user);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await apiFetch("/logout", { method: "GET" });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
