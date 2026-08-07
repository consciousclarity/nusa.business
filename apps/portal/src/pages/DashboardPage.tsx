import type { User } from "../api";

export function DashboardPage({ user }: { user: User }) {
  return (
    <div className="card">
      <h1>Welcome, {user.name}</h1>
      <p className="muted">Role: {user.role}</p>
      <p>
        Listeo-parity owner tools live here: manage listings, claims, bookings,
        and Dokan-parity vendor shops. Public SEO pages stay on Astro
        (nusa.business / place.island.nusa.business).
      </p>
      <ul>
        <li>
          <strong>Owners</strong> — edit listings, approve nothing (admin does
          claims), open a shop
        </li>
        <li>
          <strong>Field agents</strong> — register businesses on the ground
        </li>
        <li>
          <strong>Admins</strong> — decide claims, oversee inventory
        </li>
      </ul>
    </div>
  );
}
