import { useState } from "react";
import { api, type User } from "../api";

export function InvitesPage({ user }: { user: User }) {
  const [email, setEmail] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [result, setResult] = useState<{
    registerPath: string;
    token: string;
    email: string;
  } | null>(null);
  const [error, setError] = useState("");

  if (user.role !== "admin") {
    return (
      <div className="card">
        <h1>Invites</h1>
        <p className="error">Admin only.</p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const data = await api<{
        registerPath: string;
        token: string;
        invite: { email: string };
      }>("/v1/invites", {
        method: "POST",
        body: JSON.stringify({
          email,
          role: "owner",
          businessId: businessId || undefined,
        }),
      });
      setResult({
        registerPath: data.registerPath,
        token: data.token,
        email: data.invite.email,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    }
  }

  return (
    <div>
      <h1>Owner invites</h1>
      <p className="muted">
        Optional owner invite with a pre-filled email, or to attach a listing.
        Owners can also self-register. Field agents and admins still need an
        invite. Deliver the register link out-of-band (email or WhatsApp). Do
        not paste tokens into public tickets.
      </p>
      <div className="card">
        <form className="stack" onSubmit={submit}>
          <label>
            Owner email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Optional business ID to resume after signup
            <input
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="biz-…"
            />
          </label>
          <button type="submit">Create invite</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
      {result && (
        <div className="card">
          <p>
            Invite for <strong>{result.email}</strong>
          </p>
          <p className="muted">Register path (relative to portal origin):</p>
          <code>{result.registerPath}</code>
        </div>
      )}
    </div>
  );
}
