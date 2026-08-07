const API = import.meta.env.PUBLIC_API_URL || "http://localhost:8787";

export async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export { API };
