import { useEffect, useState } from "react";
import { api, type User } from "../api";

type ListingRow = {
  business: { id: string; name: string; vendorId?: string };
};

type Vendor = {
  id: string;
  name: string;
  description: string;
  commissionPercent: number;
  products: { name: string; price: number; currency: string; stock: number }[];
  mercur?: { status: string; note: string };
};

export function VendorPage({ user }: { user: User }) {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api<{ businesses: ListingRow[] }>("/v1/portal/listings").then((d) => {
      setListings(d.businesses);
      if (d.businesses[0]) setBusinessId(d.businesses[0].business.id);
    });
  }, []);

  async function createVendor(e: React.FormEvent) {
    e.preventDefault();
    const data = await api<{ vendor: Vendor }>("/v1/marketplace/vendors", {
      method: "POST",
      body: JSON.stringify({ businessId, name, description }),
    });
    setMsg(`Vendor ${data.vendor.id} linked (commission ${data.vendor.commissionPercent}%).`);
    const full = await api<{ vendor: Vendor; mercur: Vendor["mercur"] }>(
      `/v1/marketplace/vendors/${data.vendor.id}`,
    );
    setVendor({ ...full.vendor, mercur: full.mercur });
  }

  async function loadExisting() {
    const row = listings.find((l) => l.business.id === businessId);
    if (!row?.business.vendorId) {
      setMsg("This listing has no vendor yet.");
      setVendor(null);
      return;
    }
    const full = await api<{ vendor: Vendor; mercur: Vendor["mercur"] }>(
      `/v1/marketplace/vendors/${row.business.vendorId}`,
    );
    setVendor({ ...full.vendor, mercur: full.mercur });
    setMsg("");
  }

  return (
    <div>
      <h1>Vendor shop (multi-vendor marketplace)</h1>
      <p className="muted">
        Signed in as {user.email}. Local marketplace module provides vendor
        stores. When Mercur/Medusa is deployed, replace vendor ids with
        Mercur vendor UUIDs — commission defaults to 0%.
      </p>

      <div className="card">
        <form className="stack" onSubmit={createVendor}>
          <label>
            Business
            <select
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
            >
              {listings.map((l) => (
                <option key={l.business.id} value={l.business.id}>
                  {l.business.name}
                  {l.business.vendorId ? " (has shop)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            Shop name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="row">
            <button type="submit">Create / link vendor store</button>
            <button type="button" onClick={loadExisting}>
              Load existing
            </button>
          </div>
          {msg && <p className="success">{msg}</p>}
        </form>
      </div>

      {vendor && (
        <div className="card">
          <h2>{vendor.name}</h2>
          <p>{vendor.description}</p>
          <p className="muted">
            Commission {vendor.commissionPercent}% · {vendor.mercur?.status} —{" "}
            {vendor.mercur?.note}
          </p>
          <h3>Products</h3>
          {vendor.products.length === 0 && (
            <p className="muted">No products yet.</p>
          )}
          {vendor.products.map((p) => (
            <div key={p.name} className="row">
              <strong>{p.name}</strong>
              <span className="pill">
                {p.price.toLocaleString("id-ID")} {p.currency}
              </span>
              <span className="pill">stock {p.stock}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
