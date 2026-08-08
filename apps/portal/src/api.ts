const API = import.meta.env.VITE_API_URL || "http://localhost:8787";

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export async function api<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  // Attach the stored session token by default so every call is authenticated;
  // pass `token` explicitly to override (e.g. immediately after login).
  const token = init?.token ?? loadSession()?.token;
  if (token) headers.set("authorization", `Bearer ${token}`);
  const res = await fetch(`${API}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function loadSession(): { user: User; token: string } | null {
  const raw = localStorage.getItem("nusa.session");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session: { user: User; token: string } | null) {
  if (!session) localStorage.removeItem("nusa.session");
  else localStorage.setItem("nusa.session", JSON.stringify(session));
}

export { API };
