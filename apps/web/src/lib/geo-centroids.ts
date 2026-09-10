/** Approximate centroids so empty hubs still open a sensible map view. */

export type MapView = { lat: number; lng: number; zoom: number };

export const INDONESIA_VIEW: MapView = { lat: -2.5, lng: 118.0, zoom: 5 };

/** Province, region-hub, and a few well-known place slugs. */
export const GEO_CENTROIDS: Record<string, MapView> = {
  aceh: { lat: 4.6951, lng: 96.7494, zoom: 8 },
  "sumatera-utara": { lat: 3.5952, lng: 98.6722, zoom: 8 },
  "sumatera-barat": { lat: -0.9471, lng: 100.4172, zoom: 8 },
  riau: { lat: 0.5071, lng: 101.4478, zoom: 8 },
  jambi: { lat: -1.6101, lng: 103.6131, zoom: 8 },
  "sumatera-selatan": { lat: -3.0, lng: 104.0, zoom: 8 },
  bengkulu: { lat: -3.8004, lng: 102.2655, zoom: 8 },
  lampung: { lat: -5.45, lng: 105.2667, zoom: 8 },
  "kepulauan-bangka-belitung": { lat: -2.7411, lng: 106.4406, zoom: 8 },
  "kepulauan-riau": { lat: 0.9167, lng: 104.45, zoom: 8 },
  "dki-jakarta": { lat: -6.2088, lng: 106.8456, zoom: 11 },
  "jawa-barat": { lat: -6.9175, lng: 107.6191, zoom: 8 },
  "jawa-tengah": { lat: -7.1509, lng: 110.1403, zoom: 8 },
  "di-yogyakarta": { lat: -7.7956, lng: 110.3695, zoom: 10 },
  "jawa-timur": { lat: -7.5361, lng: 112.2384, zoom: 8 },
  banten: { lat: -6.4058, lng: 106.064, zoom: 9 },
  bali: { lat: -8.4095, lng: 115.1889, zoom: 9 },
  "nusa-tenggara-barat": { lat: -8.6529, lng: 117.3616, zoom: 8 },
  "nusa-tenggara-timur": { lat: -8.6574, lng: 121.0794, zoom: 7 },
  "kalimantan-barat": { lat: -0.0263, lng: 109.3425, zoom: 7 },
  "kalimantan-tengah": { lat: -1.6815, lng: 113.3824, zoom: 7 },
  "kalimantan-selatan": { lat: -3.0926, lng: 115.2838, zoom: 8 },
  "kalimantan-timur": { lat: 0.5387, lng: 116.4194, zoom: 7 },
  "kalimantan-utara": { lat: 3.0, lng: 116.0, zoom: 7 },
  "sulawesi-utara": { lat: 0.6241, lng: 123.975, zoom: 8 },
  "sulawesi-tengah": { lat: -1.43, lng: 121.4456, zoom: 7 },
  "sulawesi-selatan": { lat: -3.6687, lng: 119.974, zoom: 8 },
  "sulawesi-tenggara": { lat: -4.1449, lng: 122.1746, zoom: 8 },
  gorontalo: { lat: 0.6999, lng: 122.4467, zoom: 9 },
  "sulawesi-barat": { lat: -2.8441, lng: 119.2321, zoom: 8 },
  maluku: { lat: -3.2385, lng: 130.1453, zoom: 7 },
  "maluku-utara": { lat: 0.63, lng: 127.48, zoom: 7 },
  "papua-barat": { lat: -1.3361, lng: 133.1747, zoom: 7 },
  "papua-barat-daya": { lat: -0.876, lng: 131.256, zoom: 8 },
  papua: { lat: -2.5337, lng: 140.7181, zoom: 7 },
  "papua-selatan": { lat: -7.666, lng: 139.5, zoom: 7 },
  "papua-tengah": { lat: -3.988, lng: 136.0, zoom: 7 },
  "papua-pegunungan": { lat: -4.1, lng: 138.95, zoom: 8 },
  java: { lat: -7.3, lng: 110.0, zoom: 7 },
  sumatra: { lat: 0.6, lng: 101.3, zoom: 6 },
  sulawesi: { lat: -2.0, lng: 120.0, zoom: 6 },
  kalimantan: { lat: -0.5, lng: 113.9, zoom: 6 },
  lombok: { lat: -8.65, lng: 116.3249, zoom: 9 },
};

export function geoView(slug?: string | null): MapView {
  if (!slug) return INDONESIA_VIEW;
  return GEO_CENTROIDS[slug] ?? INDONESIA_VIEW;
}
