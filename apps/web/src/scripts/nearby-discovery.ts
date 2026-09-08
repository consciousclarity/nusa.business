import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type DiscoveryNeighbor = {
  business: {
    id: string;
    name: string;
    slug: string;
    summary: string;
    categories: string[];
    lat?: number;
    lng?: number;
  };
  place: { slug: string; name: string };
  island: { slug: string };
  distanceKm: number;
  href: string;
};

type DiscoveryPayload = {
  origin: { lat: number; lng: number } | null;
  nearby: Omit<DiscoveryNeighbor, "href">[];
  nearbyCategories: string[];
  activeCategory: string | null;
};

function withHref(n: Omit<DiscoveryNeighbor, "href">): DiscoveryNeighbor {
  return {
    ...n,
    href: `/host/${n.place.slug}.${n.island.slug}/${n.business.slug}`,
  };
}

function renderList(root: HTMLElement, items: DiscoveryNeighbor[], emptyLabel: string) {
  if (items.length === 0) {
    root.innerHTML = `<p class="meta">${emptyLabel}</p>`;
    return;
  }
  const ol = document.createElement("ol");
  ol.className = "index-list";
  items.forEach((n, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="index-row">
        <span class="n">${String(i + 1).padStart(2, "0")}</span>
        <a class="name" href="${n.href}">${escapeHtml(n.business.name)}</a>
        <span class="rhs">${n.distanceKm.toFixed(2)} km</span>
      </div>
      <p class="index-desc">${escapeHtml(n.business.summary)}</p>`;
    ol.appendChild(li);
  });
  root.replaceChildren(ol);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function syncMap(
  map: L.Map,
  layer: L.LayerGroup,
  origin: { lat: number; lng: number } | null,
  items: DiscoveryNeighbor[],
) {
  layer.clearLayers();
  const bounds: L.LatLngExpression[] = [];
  if (origin) {
    const here = L.circleMarker([origin.lat, origin.lng], {
      radius: 7,
      color: "#1a1c22",
      fillColor: "#1a1c22",
      fillOpacity: 1,
      weight: 1,
    }).bindPopup("Here");
    layer.addLayer(here);
    bounds.push([origin.lat, origin.lng]);
  }
  items.forEach((n, i) => {
    if (typeof n.business.lat !== "number" || typeof n.business.lng !== "number") return;
    const m = L.circleMarker([n.business.lat, n.business.lng], {
      radius: 6,
      color: "#1a29c4",
      fillColor: "#1a29c4",
      fillOpacity: 0.85,
      weight: 1,
    }).bindPopup(
      `<strong>${String(i + 1).padStart(2, "0")}. ${escapeHtml(n.business.name)}</strong><br>${n.distanceKm.toFixed(2)} km`,
    );
    layer.addLayer(m);
    bounds.push([n.business.lat, n.business.lng]);
  });
  if (bounds.length > 0) {
    map.fitBounds(L.latLngBounds(bounds), { padding: [24, 24], maxZoom: 15 });
  }
}

export function mountNearbyDiscovery(root: HTMLElement) {
  const endpoint = root.dataset.endpoint;
  const emptyLabel = root.dataset.emptyLabel || "No listings.";
  const listEl = root.querySelector<HTMLElement>("[data-nearby-list]");
  const mapEl = root.querySelector<HTMLElement>("[data-nearby-map]");
  const chips = root.querySelectorAll<HTMLButtonElement>("[data-category]");
  if (!endpoint || !listEl || !mapEl) return;

  const map = L.map(mapEl, { scrollWheelZoom: false, attributionControl: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  const layer = L.layerGroup().addTo(map);
  map.setView([-8.54, 115.32], 13);

  async function load(category: string | null) {
    const url = new URL(endpoint!);
    if (category) url.searchParams.set("category", category);
    else url.searchParams.delete("category");
    const res = await fetch(url.toString());
    if (!res.ok) return;
    const data = (await res.json()) as DiscoveryPayload;
    const nearby = data.nearby.map(withHref);
    chips.forEach((btn) => {
      const cat = decodeURIComponent(btn.dataset.category || "");
      const active = cat === (data.activeCategory ?? "");
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.classList.toggle("is-active", active);
    });
    renderList(listEl!, nearby, emptyLabel);
    syncMap(map, layer, data.origin, nearby);
  }

  chips.forEach((btn) => {
    btn.addEventListener("click", () => {
      const raw = btn.dataset.category || "";
      void load(raw ? decodeURIComponent(raw) : null);
    });
  });

  const initialRaw = root.dataset.activeCategory || chips[0]?.dataset.category || "";
  const initial = initialRaw ? decodeURIComponent(initialRaw) : null;
  void load(initial);
}
