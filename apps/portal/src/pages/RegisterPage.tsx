import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api, type User } from "../api";
import { safePortalReturnTo } from "@nusa/shared";

export function RegisterPage({
  onLogin,
}: {
  onLogin: (s: { user: User; token: string }) => void;
}) {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const tokenFromQuery = params.get("token") || "";
  const returnToHint = safePortalReturnTo(params.get("returnTo"));

  const [token, setToken] = useState(tokenFromQuery);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [listing, setListing] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!token) return;
    api<{
      email: string;
      listing?: { name: string; place?: string; island?: string };
    }>(`/v1/auth/invite/${encodeURIComponent(token)}`)
      .then((data) => {
        setEmail(data.email);
        if (data.listing) {
          const where =
            data.listing.place && data.listing.island
              ? ` — ${data.listing.place}, ${data.listing.island}`
              : "";
          setListing(`${data.listing.name}${where}`);
        }
        setInfo("Invitation valid. Create your password to continue.");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Invalid invitation");
      });
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = await api<{
        user: User;
        token: string;
        returnTo?: string;
      }>("/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ token, name, password }),
      });
      onLogin(data);
      nav(safePortalReturnTo(data.returnTo || returnToHint));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h1>Create owner account</h1>
      <p className="muted">
        Launch onboarding is invite-only. Ask an admin for an invitation link —
        there is no open self-signup.
      </p>
      {listing && (
        <p className="muted">
          After registering you can claim <strong>{listing}</strong>.
        </p>
      )}
      <form className="stack" onSubmit={submit}>
        <label>
          Invite token
          <input
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
          />
        </label>
        {email && (
          <p className="muted">
            Account email: <strong>{email}</strong>
          </p>
        )}
        <label>
          Your name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </label>
        <label>
          Password (min 12 characters)
          <input
            type="password"
            required
            minLength={12}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        {info && <p className="muted">{info}</p>}
        {error && <p className="error">{error}</p>}
        <button type="submit">Create account</button>
      </form>
      <p className="muted" style={{ marginTop: "1rem" }}>
        <Link to="/login">Already have an account?</Link>
      </p>
    </div>
  );
}
