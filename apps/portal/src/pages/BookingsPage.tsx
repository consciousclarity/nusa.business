import { useEffect, useState } from "react";
import { api } from "../api";

type Booking = {
  id: string;
  businessId: string;
  mode: string;
  customerName: string;
  customerEmail: string;
  startDate: string;
  endDate?: string;
  timeSlot?: string;
  tickets?: number;
  status: string;
  totalAmount: number;
  currency: string;
};

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    api<{ bookings: Booking[] }>("/v1/bookings").then((d) =>
      setBookings(d.bookings),
    );
  }, []);

  return (
    <div>
      <h1>Bookings</h1>
      <p className="muted">
        Listeo-parity modes: service (slots), rental (date range), event
        (tickets). Created from public listing pages.
      </p>
      {bookings.length === 0 && (
        <div className="card">No bookings yet. Try a service listing such as Spa Jimbaran Bay.</div>
      )}
      {bookings.map((b) => (
        <div className="card" key={b.id}>
          <div className="row">
            <strong>{b.id}</strong>
            <span className="pill">{b.mode}</span>
            <span className="pill">{b.status}</span>
          </div>
          <p>
            {b.customerName} · {b.customerEmail}
          </p>
          <p className="muted">
            Business {b.businessId} · {b.startDate}
            {b.endDate ? ` → ${b.endDate}` : ""}
            {b.timeSlot ? ` · ${b.timeSlot}` : ""}
            {b.tickets ? ` · ${b.tickets} tickets` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
