import { useEffect, useState } from "react";
import { CATEGORIES } from "@nusa/shared";
import { api, type User } from "../api";

type Island = { slug: string; name: string };
type Place = { slug: string; name: string };

export function FieldPage({ user }: { user: User }) {
  const [islands, setIslands] = useState<Island[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    islandSlug: "bali",
    placeSlug: "gianyar",
    name: "",
    summary: "",
    categories: "Food & Drink",
    whatsapp: "",
    address: "",
    bookingMode: "none",
  });

  useEffect(() => {
    api<{ islands: Island[] }>("/v1/islands").then((d) => setIslands(d.islands));
  }, []);

  useEffect(() => {
    api<{ places: Place[] }>(`/v1/places?island=${form.islandSlug}`).then(
      (d) => {
        setPlaces(d.places);
        if (!d.places.find((p) => p.slug === form.placeSlug) && d.places[0]) {
          setForm((f) => ({ ...f, placeSlug: d.places[0]!.slug }));
        }
      },
    );
  }, [form.islandSlug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      const data = await api<{
        business: { name: string; slug: string };
        context: { place: Place; island: Island };
      }>("/v1/field/register", {
        method: "POST",
        body: JSON.stringify({
          agentId: user.id,
          islandSlug: form.islandSlug,
          placeSlug: form.placeSlug,
          name: form.name,
          summary: form.summary,
          categories: form.categories.split(",").map((s) => s.trim()),
          whatsapp: form.whatsapp,
          address: form.address,
          bookingMode: form.bookingMode,
        }),
      });
      setMsg(
        `Registered ${data.business.name} at ${data.context.place.slug}.${data.context.island.slug}.nusa.business/${data.business.slug}`,
      );
      setForm((f) => ({ ...f, name: "", summary: "", whatsapp: "", address: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  const allowed = user.role === "field_agent" || user.role === "admin";

  return (
    <div>
      <h1>Field ops registration</h1>
      {!allowed && (
        <p className="error">
          Sign in as field agent (agent@nusa.business / agent123) to register
          businesses on the ground.
        </p>
      )}
      <div className="card">
        <form className="stack" onSubmit={submit}>
          <label>
            Island
            <select
              value={form.islandSlug}
              onChange={(e) =>
                setForm({ ...form, islandSlug: e.target.value })
              }
              disabled={!allowed}
            >
              {islands.map((i) => (
                <option key={i.slug} value={i.slug}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Place
            <select
              value={form.placeSlug}
              onChange={(e) => setForm({ ...form, placeSlug: e.target.value })}
              disabled={!allowed}
            >
              {places.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Business name
            <input
              required
              disabled={!allowed}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Summary
            <input
              required
              disabled={!allowed}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </label>
          <label>
            WhatsApp
            <input
              disabled={!allowed}
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
          </label>
          <label>
            Address
            <input
              disabled={!allowed}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>
          <label>
            Categories
            <input
              disabled={!allowed}
              value={form.categories}
              onChange={(e) => setForm({ ...form, categories: e.target.value })}
              list="field-cats"
            />
            <datalist id="field-cats">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label>
            Booking mode
            <select
              disabled={!allowed}
              value={form.bookingMode}
              onChange={(e) =>
                setForm({ ...form, bookingMode: e.target.value })
              }
            >
              <option value="none">None</option>
              <option value="service">Service</option>
              <option value="rental">Rental</option>
              <option value="event">Event</option>
            </select>
          </label>
          <button type="submit" disabled={!allowed}>
            Register on site
          </button>
          {msg && <p className="success">{msg}</p>}
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
