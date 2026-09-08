import { Link, Navigate, Route, Routes, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { loadSession, saveSession, type User } from "./api";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import {
  RecoveryConfirmPage,
  RecoveryRequestPage,
} from "./pages/RecoveryPages";
import { DashboardPage } from "./pages/DashboardPage";
import { ListingsPage } from "./pages/ListingsPage";
import { ClaimPage } from "./pages/ClaimPage";
import { FieldPage } from "./pages/FieldPage";
import { BookingsPage } from "./pages/BookingsPage";
import { VendorPage } from "./pages/VendorPage";
import { InvitesPage } from "./pages/InvitesPage";

function RequireAuth({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  const location = useLocation();
  if (user) return children;
  const returnTo = `${location.pathname}${location.search}`;
  return (
    <Navigate
      to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
      replace
    />
  );
}

export function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(loadSession()?.user ?? null);
  }, []);

  function onLogin(session: { user: User; token: string }) {
    saveSession(session);
    setUser(session.user);
  }

  function onLogout() {
    saveSession(null);
    setUser(null);
  }

  return (
    <div className="shell">
      <header>
        <Link className="brand" to="/">
          Nusa Portal
        </Link>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/listings">Listings</Link>
          <Link to="/claim">Claim</Link>
          <Link to="/field">Field ops</Link>
          <Link to="/bookings">Bookings</Link>
          <Link to="/vendor">Vendor shop</Link>
          {user?.role === "admin" && <Link to="/invites">Invites</Link>}
          {user ? (
            <button type="button" onClick={onLogout}>
              Log out ({user.role})
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
        <Route path="/register" element={<RegisterPage onLogin={onLogin} />} />
        <Route path="/recovery" element={<RecoveryRequestPage />} />
        <Route
          path="/recovery/confirm"
          element={<RecoveryConfirmPage onLogin={onLogin} />}
        />
        <Route
          path="/"
          element={
            <RequireAuth user={user}>
              <DashboardPage user={user!} />
            </RequireAuth>
          }
        />
        <Route
          path="/listings"
          element={
            <RequireAuth user={user}>
              <ListingsPage user={user!} />
            </RequireAuth>
          }
        />
        <Route
          path="/claim"
          element={
            <RequireAuth user={user}>
              <ClaimPage user={user!} />
            </RequireAuth>
          }
        />
        <Route
          path="/field"
          element={
            <RequireAuth user={user}>
              <FieldPage user={user!} />
            </RequireAuth>
          }
        />
        <Route
          path="/bookings"
          element={
            <RequireAuth user={user}>
              <BookingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/vendor"
          element={
            <RequireAuth user={user}>
              <VendorPage user={user!} />
            </RequireAuth>
          }
        />
        <Route
          path="/invites"
          element={
            <RequireAuth user={user}>
              <InvitesPage user={user!} />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
}
