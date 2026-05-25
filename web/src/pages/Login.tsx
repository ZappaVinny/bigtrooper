import { useState, useEffect } from "react";
import { apiFetch } from "../api/client";

export default function Login() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/ping")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch((err) => console.error("Error fetching status:", err));
  }, []);

  return (
    <div>
      <p>{status ? status : "loading..."}</p>
    </div>
  );
}
