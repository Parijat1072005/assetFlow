import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { ClipboardList, ArrowRightLeft, AlertTriangle } from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: "badge-green", RETURNED: "badge-gray", TRANSFERRED: "badge-blue",
    REQUESTED: "badge-yellow", APPROVED: "badge-green", REJECTED: "badge-red", COMPLETED: "badge-blue"
  };
  return `badge ${map[status] || "badge-gray"}`;
}

export default function AllocationsPage() {
  const navigate = useNavigate();

  const { data: allocations, isLoading } = useQuery({
    queryKey: ["allocations"],
    queryFn: () => api.get("/allocations").then(r => r.data.data),
    placeholderData: [],
  });

  const overdueCount = allocations?.filter((a: any) => {
    if (a.status !== "ACTIVE" || !a.expectedReturnDate) return false;
    return new Date(a.expectedReturnDate) < new Date();
  }).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Allocations</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Track who holds which assets and manage transfers
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn-primary" onClick={() => navigate("/allocations/new")}>
            <ClipboardList size={16} /> Allocate Asset
          </button>
          <button className="btn-secondary" onClick={() => navigate("/allocations/return")}>
            <ArrowRightLeft size={16} /> Return / Transfer
          </button>
        </div>
      </div>

      {overdueCount > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.875rem 1.125rem",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "var(--radius-md)", marginBottom: "1.5rem",
          color: "var(--danger)", fontSize: "0.875rem"
        }}>
          <AlertTriangle size={16} />
          <strong>{overdueCount} allocation{overdueCount > 1 ? "s" : ""} overdue</strong>
          — please follow up with the asset holders.
        </div>
      )}

      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading allocations…</div>
        ) : !allocations?.length ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <ClipboardList size={36} style={{ margin: "0 auto 0.75rem", display: "block", opacity: 0.3 }} />
            <p style={{ color: "var(--text-muted)" }}>No allocations yet</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Holder</th>
                <th>Type</th>
                <th>Allocated On</th>
                <th>Expected Return</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((a: any) => {
                const isOverdue = a.status === "ACTIVE" && a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date();
                return (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{a.asset?.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{a.asset?.assetTag}</div>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {a.holderEmployee?.name || a.holderDepartment?.name || "—"}
                    </td>
                    <td>
                      <span className={`badge ${a.holderType === "EMPLOYEE" ? "badge-purple" : "badge-blue"}`}>
                        {a.holderType}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {new Date(a.allocatedDate).toLocaleDateString()}
                    </td>
                    <td style={{ color: isOverdue ? "var(--danger)" : "var(--text-secondary)" }}>
                      {a.expectedReturnDate ? new Date(a.expectedReturnDate).toLocaleDateString() : "—"}
                      {isOverdue && <span style={{ marginLeft: 6, fontSize: "0.7rem" }}>OVERDUE</span>}
                    </td>
                    <td><span className={statusBadge(a.status)}>{a.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
