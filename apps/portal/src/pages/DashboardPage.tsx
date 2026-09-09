import { Link } from "react-router";
import type { User } from "../api";

export function DashboardPage({ user }: { user: User }) {
  const ownerish =
    user.role === "owner" || user.role === "vendor" || user.role === "admin";
  const field = user.role === "field_agent" || user.role === "admin";

  return (
    <div className="card">
      <h1>Welcome, {user.name}</h1>
      <p className="muted">Signed in as {user.role.replace("_", " ")}.</p>
      {user.role === "owner" && (
        <p>
          Add a missing listing, or claim one that already exists. A submitted
          claim does not grant editing rights until an operator approves it.
        </p>
      )}
      {user.role === "field_agent" && (
        <p>Register businesses on the ground from Field ops. You cannot edit listings you do not own.</p>
      )}
      {user.role === "admin" && (
        <p>Decide claims, send invites for agents, and oversee listings.</p>
      )}
      {user.role === "vendor" && (
        <p>Manage your shop and bookings. Listing edits stay limited to businesses you own.</p>
      )}
      <ul>
        {ownerish && (
          <li>
            <Link to="/listings">Your listings</Link>
            {" — "}
            add a missing business or edit listings you own
          </li>
        )}
        <li>
          <Link to="/claim">Claim a listing</Link>
          {" — "}
          pending until approved
        </li>
        {field && (
          <li>
            <Link to="/field">Field ops</Link>
            {" — "}
            register a business on site
          </li>
        )}
        {ownerish && (
          <li>
            <Link to="/bookings">Booking requests</Link>
          </li>
        )}
        {user.role === "admin" && (
          <li>
            <Link to="/invites">Invites</Link>
            {" — "}
            agents and operators only; owners self-register
          </li>
        )}
      </ul>
    </div>
  );
}
