import { Link, Navigate, Route, Routes } from "react-router";
import { useEffect, useState } from "react";
import { loadSession, saveSession, type User } from "./api";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ListingsPage } from "./pages/ListingsPage";
import { ClaimPage } from "./pages/ClaimPage";
import { FieldPage } from "./pages/FieldPage";
import { BookingsPage } from "./pages/BookingsPage";
import { VendorPage } from "./pages/VendorPage";

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
        <Route
          path="/"
          element={user ? <DashboardPage user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/listings"
          element={user ? <ListingsPage user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/claim"
          element={user ? <ClaimPage user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/field"
          element={user ? <FieldPage user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/bookings"
          element={user ? <BookingsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/vendor"
          element={user ? <VendorPage user={user} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </div>
  );
}
