import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { api, type User } from "../api";

type SearchHit = {
  business: { id: string; name: string; slug: string; status: string };
  place?: { slug: string; name: string };
  island?: { slug: string; name: string };
};

type Claim = {
  id: string;
  businessId: string;
  claimantUserId: string;
  status: string;
  note?: string;
  decidedByUserId?: string;
  decidedAt?: string;
  decisionReason?: string;
};

type ClaimContext = {
  business: { id: string; name: string; status: string };
  place: { name: string };
  island: { name: string };
};

export function ClaimPage({ user }: { user: User }) {
  const [params] = useSearchParams();
  const preset = params.get("businessId") || "";
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [businessId, setBusinessId] = useState(preset);
  const [context, setContext] = useState<ClaimContext | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const selected = useMemo(
    () => hits.find((h) => h.business.id === businessId),
    [hits, businessId],
  );

  const displayName =
    context?.business.name ||
    selected?.business.name ||
    (businessId ? `Listing ${businessId}` : "");

  const displayWhere =
    context
      ? `${context.place.name}, ${context.island.name}`
      : selected?.place && selected?.island
        ? `${selected.place.name}, ${selected.island.name}`
        : "";

  async function refreshClaims() {
    const data = await api<{ claims: Claim[] }>("/v1/claims");
    setClaims(data.claims);
  }

  useEffect(() => {
    refreshClaims().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (preset) setBusinessId(preset);
  }, [preset]);

  useEffect(() => {
    if (!businessId) {
      setContext(null);
      return;
    }
    api<ClaimContext>(`/v1/claim-context/${encodeURIComponent(businessId)}`)
      .then(setContext)
      .catch(() => setContext(null));
  }, [businessId]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const data = await api<{ results: SearchHit[] }>(
      `/v1/search?q=${encodeURIComponent(q)}`,
    );
    setHits(data.results);
  }

  async function submitClaim(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await api("/v1/claims", {
        method: "POST",
        body: JSON.stringify({
          businessId,
          note,
        }),
      });
      setMsg("Claim submitted — free, pending admin approval. You cannot edit the listing until approved.");
      await refreshClaims();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed");
    }
  }

  async function decide(id: string, status: "approved" | "rejected") {
    setError("");
    try {
      await api(`/v1/claims/${id}/decide`, {
        method: "POST",
        body: JSON.stringify({ status, reason: reason || undefined }),
      });
      setReason("");
      await refreshClaims();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decision failed");
    }
  }

  return (
    <div>
      <h1>Claim listing</h1>
      <p className="muted">
        Claims stay pending until an admin approves. Approval is required before
        you can edit the listing. Rejected claims can be resubmitted with new evidence.
      </p>
      <div className="card">
        <form className="stack" onSubmit={search}>
          <label>
            Find business
            <input value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <button type="submit">Search</button>
        </form>
        <div className="stack" style={{ marginTop: "1rem" }}>
          {hits.map((h) => (
            <button
              key={h.business.id}
              type="button"
              className="btn"
              style={{
                background:
                  businessId === h.business.id ? "#0f6b4c" : "#5c6b63",
              }}
              onClick={() => setBusinessId(h.business.id)}
            >
              {h.business.name}
              {h.place && h.island
                ? ` — ${h.place.name}, ${h.island.name}`
                : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <form className="stack" onSubmit={submitClaim}>
          {displayName ? (
            <p>
              Claiming <strong>{displayName}</strong>
              {displayWhere ? ` — ${displayWhere}` : ""}
            </p>
          ) : (
            <p className="muted">Search and select a listing to claim.</p>
          )}
          <input type="hidden" value={businessId} readOnly />
          <label>
            Evidence for operators (kept private)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="I am the owner / manager… include WhatsApp or docs reference"
              required
            />
          </label>
          <button type="submit" disabled={!businessId}>
            Submit free claim
          </button>
          {msg && <p className="success">{msg}</p>}
          {error && <p className="error">{error}</p>}
        </form>
      </div>

      <h2>Claims</h2>
      {user.role === "admin" && (
        <div className="card">
          <label>
            Decision reason (optional, recorded on approve/reject)
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Verified WhatsApp match / insufficient evidence"
            />
          </label>
        </div>
      )}
      {claims.map((c) => (
        <div className="card" key={c.id}>
          <div className="row">
            <strong>{c.id}</strong>
            <span className="pill">{c.status}</span>
          </div>
          <p className="muted">
            Business {c.businessId} · claimant {c.claimantUserId}
          </p>
          {c.note && <p>{c.note}</p>}
          {c.decidedAt && (
            <p className="muted">
              Decided {c.decidedAt}
              {c.decidedByUserId ? ` by ${c.decidedByUserId}` : ""}
              {c.decisionReason ? ` — ${c.decisionReason}` : ""}
            </p>
          )}
          {user.role === "admin" && c.status === "pending" && (
            <div className="row">
              <button type="button" onClick={() => decide(c.id, "approved")}>
                Approve
              </button>
              <button type="button" onClick={() => decide(c.id, "rejected")}>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
