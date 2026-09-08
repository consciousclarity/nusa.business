import { useState } from "react";
import { useNavigate } from "react-router";
import { api, type User } from "../api";

type DemoLogin = {
  email: string;
  password: string;
  hint: string;
};

/**
 * Keep demo strings inside a DEV-only branch so production Vite builds can
 * eliminate them. Staging may opt in with VITE_NUSA_DEMO_LOGIN=true.
 */
function demoLoginConfig(): DemoLogin | null {
  if (
    import.meta.env.DEV ||
    import.meta.env.VITE_NUSA_DEMO_LOGIN === "true"
  ) {
    return {
      email: "owner@example.com",
      password: "owner123",
      hint: "Demo: owner@example.com / owner123 · agent@nusa.business / agent123 · admin@nusa.business / admin123",
    };
  }
  return null;
}

const demoLogin = demoLoginConfig();

export function LoginPage({
  onLogin,
}: {
  onLogin: (s: { user: User; token: string }) => void;
}) {
  const nav = useNavigate();
  const [email, setEmail] = useState(demoLogin?.email ?? "");
  const [password, setPassword] = useState(demoLogin?.password ?? "");
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
      {demoLogin && <p className="muted">{demoLogin.hint}</p>}
      <form className="stack" onSubmit={submit}>
        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
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
