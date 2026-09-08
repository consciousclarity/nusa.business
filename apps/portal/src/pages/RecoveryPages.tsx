import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api, type User } from "../api";
import { safePortalReturnTo } from "@nusa/shared";

export function RecoveryRequestPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [devPath, setDevPath] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDevPath("");
    try {
      const data = await api<{
        message: string;
        recoveryPath?: string;
      }>("/v1/auth/recovery/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMsg(data.message);
      if (data.recoveryPath) setDevPath(data.recoveryPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h1>Account recovery</h1>
      <p className="muted">
        At launch, recovery links are operator-delivered. In development the API
        may return the link directly.
      </p>
      <form className="stack" onSubmit={submit}>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </label>
        {msg && <p className="muted">{msg}</p>}
        {devPath && (
          <p className="muted">
            Dev link: <Link to={devPath}>{devPath}</Link>
          </p>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit">Request recovery</button>
      </form>
      <p className="muted" style={{ marginTop: "1rem" }}>
        <Link to="/login">Back to sign in</Link>
      </p>
    </div>
  );
}

export function RecoveryConfirmPage({
  onLogin,
}: {
  onLogin: (s: { user: User; token: string }) => void;
}) {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const returnTo = safePortalReturnTo(params.get("returnTo"));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = await api<{ user: User; token: string }>(
        "/v1/auth/recovery/confirm",
        {
          method: "POST",
          body: JSON.stringify({ token, password }),
        },
      );
      onLogin(data);
      nav(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recovery failed");
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h1>Set a new password</h1>
      <form className="stack" onSubmit={submit}>
        <label>
          Recovery token
          <input
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label>
          New password (min 12 characters)
          <input
            type="password"
            required
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Update password</button>
      </form>
    </div>
  );
}
