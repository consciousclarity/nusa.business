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
};

export function ClaimPage({ user }: { user: User }) {
  const [params] = useSearchParams();
  const preset = params.get("businessId") || "";
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [businessId, setBusinessId] = useState(preset);
  const [note, setNote] = useState("");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [msg, setMsg] = useState("");

  const selected = useMemo(
    () => hits.find((h) => h.business.id === businessId),
    [hits, businessId],
  );

  async function refreshClaims() {
    const data = await api<{ claims: Claim[] }>("/v1/claims");
    setClaims(data.claims);
  }

  useEffect(() => {
    refreshClaims().catch(() => undefined);
    if (preset) setBusinessId(preset);
  }, [preset]);

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
    await api("/v1/claims", {
      method: "POST",
      body: JSON.stringify({
        businessId,
        claimantUserId: user.id,
        note,
      }),
    });
    setMsg("Claim submitted — free, pending admin approval.");
    await refreshClaims();
  }

  async function decide(id: string, status: "approved" | "rejected") {
    await api(`/v1/claims/${id}/decide`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
    await refreshClaims();
  }

  return (
    <div>
      <h1>Claim listing</h1>
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
          <label>
            Business ID
            <input
              required
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
            />
          </label>
          {selected && (
            <p className="muted">Selected: {selected.business.name}</p>
          )}
          <label>
            Note
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="I am the owner / manager…"
            />
          </label>
          <button type="submit">Submit free claim</button>
          {msg && <p className="success">{msg}</p>}
        </form>
      </div>

      <h2>Claims</h2>
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
