import { useEffect, useState } from "react";
import { CATEGORIES } from "@nusa/shared";
import { api, type User } from "../api";

type Place = { id: string; slug: string; name: string; islandId: string };
type Island = { id: string; slug: string; name: string };
type ListingRow = {
  business: {
    id: string;
    name: string;
    slug: string;
    summary: string;
    status: string;
    categories: string[];
    bookingMode: string;
  };
  context: { place: Place; island: Island } | null;
};

export function ListingsPage({ user }: { user: User }) {
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    placeId: "",
    name: "",
    summary: "",
    description: "",
    categories: "Food & Drink",
    bookingMode: "none",
  });

  async function refresh() {
    const query =
      user.role === "admin" ? "/v1/portal/listings" : `/v1/portal/listings?ownerId=${user.id}`;
    const data = await api<{ businesses: ListingRow[] }>(query);
    setRows(data.businesses);
    const placeData = await api<{ places: Place[] }>("/v1/places");
    setPlaces(placeData.places);
    if (!form.placeId && placeData.places[0]) {
      setForm((f) => ({ ...f, placeId: placeData.places[0]!.id }));
    }
  }

  useEffect(() => {
    refresh().catch((e) => setMessage(String(e.message || e)));
  }, [user.id]);

  async function createListing(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    await api("/v1/portal/listings", {
      method: "POST",
      body: JSON.stringify({
        placeId: form.placeId,
        name: form.name,
        summary: form.summary,
        description: form.description || form.summary,
        categories: form.categories.split(",").map((s) => s.trim()),
        bookingMode: form.bookingMode,
        ownerUserId: user.id,
        status: "published",
      }),
    });
    setForm((f) => ({ ...f, name: "", summary: "", description: "" }));
    setMessage("Listing created.");
    await refresh();
  }

  return (
    <div>
      <h1>Listings</h1>
      <div className="card">
        <h2>Create listing</h2>
        <form className="stack" onSubmit={createListing}>
          <label>
            Place
            <select
              value={form.placeId}
              onChange={(e) => setForm({ ...form, placeId: e.target.value })}
            >
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.slug})
                </option>
              ))}
            </select>
          </label>
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Summary
            <input
              required
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label>
            Categories (comma-separated)
            <input
              value={form.categories}
              onChange={(e) => setForm({ ...form, categories: e.target.value })}
              list="cats"
            />
            <datalist id="cats">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label>
            Booking mode
            <select
              value={form.bookingMode}
              onChange={(e) =>
                setForm({ ...form, bookingMode: e.target.value })
              }
            >
              <option value="none">None</option>
              <option value="service">Service (time slots)</option>
              <option value="rental">Rental (date range)</option>
              <option value="event">Event (tickets)</option>
            </select>
          </label>
          <button type="submit">Save listing</button>
          {message && <p className="success">{message}</p>}
        </form>
      </div>

      <h2>Your inventory</h2>
      {rows.map((row) => (
        <div className="card" key={row.business.id}>
          <div className="row">
            <strong>{row.business.name}</strong>
            <span className="pill">{row.business.status}</span>
            <span className="pill">{row.business.bookingMode}</span>
          </div>
          <p className="muted">{row.business.summary}</p>
          {row.context && (
            <p className="muted">
              {row.context.place.slug}.{row.context.island.slug}.nusa.business/
              {row.business.slug}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
