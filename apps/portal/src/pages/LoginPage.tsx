import { useState } from "react";
import { useNavigate } from "react-router";
import { api, type User } from "../api";

export function LoginPage({
  onLogin,
}: {
  onLogin: (s: { user: User; token: string }) => void;
}) {
  const nav = useNavigate();
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("owner123");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = await api<{ user: User; token: string }>("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onLogin(data);
      nav("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h1>Sign in</h1>
      <p className="muted">
        Demo: owner@example.com / owner123 · agent@nusa.business / agent123 ·
        admin@nusa.business / admin123
      </p>
      <form className="stack" onSubmit={submit}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
