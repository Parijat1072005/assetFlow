import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { Calendar } from "lucide-react";

function statusBadge(s: string) {
  const map: Record<string, string> = {
    UPCOMING: "badge-blue", ONGOING: "badge-green",
    COMPLETED: "badge-gray", CANCELLED: "badge-red"
  };
  return `badge ${map[s] || "badge-gray"}`;
}

export default function BookingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => api.get("/bookings").then(r => r.data.data),
    placeholderData: [],
  });

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Resource Bookings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Schedule and manage shared resource reservations
        </p>
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading bookings…</div>
        ) : !data?.length ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Calendar size={36} style={{ margin: "0 auto 0.75rem", display: "block", opacity: 0.3 }} />
            <p style={{ color: "var(--text-muted)" }}>No bookings yet</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Booked By</th>
                <th>Purpose</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((b: any) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{b.asset?.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{b.asset?.assetTag}</div>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{b.requestedBy?.name}</td>
                  <td style={{ color: "var(--text-secondary)", maxWidth: 200 }}>{b.purpose || "—"}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{new Date(b.startTime).toLocaleString()}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{new Date(b.endTime).toLocaleString()}</td>
                  <td><span className={statusBadge(b.status)}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
