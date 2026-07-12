import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

const PRIORITY_BADGE: Record<string, string> = {
  LOW: "badge-gray", MEDIUM: "badge-blue", HIGH: "badge-yellow", CRITICAL: "badge-red"
};

const COLUMNS = ["PENDING", "APPROVED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS", "RESOLVED"];

export default function MaintenancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: () => api.get("/maintenance").then(r => r.data.data),
    placeholderData: [],
  });

  const byStatus: Record<string, any[]> = {};
  COLUMNS.forEach(s => { byStatus[s] = []; });
  (data || []).forEach((item: any) => {
    if (byStatus[item.status]) byStatus[item.status].push(item);
  });

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Maintenance Queue</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Track repair tickets across the Kanban workflow
        </p>
      </div>

      {isLoading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem" }}>
          {COLUMNS.map(status => (
            <div key={status} style={{ flex: "0 0 260px" }}>
              <div style={{
                padding: "0.625rem 0.875rem",
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", marginBottom: "0.75rem",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {status.replace("_", " ")}
                </span>
                <span style={{
                  background: "var(--bg-base)", border: "1px solid var(--border)",
                  borderRadius: 999, padding: "0 8px", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-secondary)"
                }}>
                  {byStatus[status].length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {byStatus[status].length === 0 && (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
                    Empty
                  </div>
                )}
                {byStatus[status].map((item: any) => (
                  <div key={item.id} className="glass-card" style={{ padding: "1rem", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#a5b4fc" }}>
                        {item.asset?.assetTag}
                      </span>
                      <span className={`badge ${PRIORITY_BADGE[item.priority]}`}>{item.priority}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.35rem" }}>
                      {item.asset?.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {item.issueDescription}
                    </div>
                    <div style={{ marginTop: "0.625rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      Raised by {item.raisedBy?.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
