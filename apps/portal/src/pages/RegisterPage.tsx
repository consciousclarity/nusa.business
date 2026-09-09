import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { api, loadSession, type User } from "../api";
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
  /** Already signed-in visitors should not re-register; do not gate on post-submit session. */
  const [alreadyAuthed] = useState(() => Boolean(loadSession()?.user));

  const [token, setToken] = useState(tokenFromQuery);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [listing, setListing] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [dest, setDest] = useState<string | null>(null);

  const inviteMode = Boolean(tokenFromQuery);

  useEffect(() => {
    if (!token) return;
    setError("");
    setInfo("");
    setEmail("");
    setListing("");
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
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const data = await api<{
        user: User;
        token: string;
        returnTo?: string;
      }>("/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(
          token
            ? { token, name, password, returnTo: returnToHint }
            : { email, name, password, returnTo: returnToHint },
        ),
      });
      const next = safePortalReturnTo(data.returnTo || returnToHint);
      setDest(next);
      onLogin(data);
      nav(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  if (alreadyAuthed) {
    return <Navigate to={returnToHint} replace />;
  }
  if (dest) {
    return <Navigate to={dest} replace />;
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h1>Create owner account</h1>
      <p className="muted">
        Free owner signup. Claiming an existing listing does not grant editing
        rights until an operator approves ownership.
      </p>
      {listing && (
        <p className="muted">
          After registering you can claim <strong>{listing}</strong>.
        </p>
      )}
      {returnToHint.startsWith("/claim") && !listing && (
        <p className="muted">
          After sign-up you will return to claim the selected listing.
        </p>
      )}
      <form className="stack" onSubmit={submit}>
        {inviteMode && email ? (
          <p className="muted">
            Account email: <strong>{email}</strong>
          </p>
        ) : (
          <label>
            Email
            <input
              type="email"
              required={!token}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
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
        {tokenFromQuery ? (
          <input type="hidden" value={token} readOnly />
        ) : (
          <details>
            <summary>Have an admin invite?</summary>
            <label>
              Invite token
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="off"
              />
            </label>
          </details>
        )}
        {info && <p className="muted">{info}</p>}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy || (Boolean(error) && Boolean(token) && !email)}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: "1rem" }}>
        <Link
          to={`/login${params.get("returnTo") ? `?returnTo=${encodeURIComponent(returnToHint)}` : ""}`}
        >
          Already have an account?
        </Link>
      </p>
    </div>
  );
}
