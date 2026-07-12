
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Lock } from "lucide-react";

const VERIFICATION_OPTS = [
  { value: "VERIFIED", label: "Verified", icon: CheckCircle, color: "#10b981" },
  { value: "MISSING", label: "Missing", icon: XCircle, color: "#ef4444" },
  { value: "DAMAGED", label: "Damaged", icon: AlertTriangle, color: "#f59e0b" },
];

export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["audit-items", id],
    queryFn: () => api.get(`/audits/${id}/items`).then(r => r.data.data),
    enabled: !!id,
  });

  const verify = async (itemId: string, verification: string) => {
    try {
      await api.patch(`/audits/${id}/items/${itemId}`, { verification });
      toast.success("Item updated");
      qc.invalidateQueries({ queryKey: ["audit-items", id] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update");
    }
  };

  const closeCycle = async () => {
    if (!window.confirm("Close this audit cycle? This will auto-flag MISSING assets as LOST and DAMAGED as conditioned.")) return;
    try {
      await api.post(`/audits/${id}/close`);
      toast.success("Audit cycle closed");
      qc.invalidateQueries({ queryKey: ["audit-items", id] });
      navigate("/audits");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to close cycle");
    }
  };

  const verified = items.filter((i: any) => i.verification !== "PENDING").length;
  const total = items.length;
  const pct = total > 0 ? Math.round((verified / total) * 100) : 0;

  if (itemsLoading) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>Loading audit…</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={() => navigate("/audits")} className="btn-secondary" style={{ padding: "0.5rem" }}><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Audit Verification</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.2rem" }}>Mark each asset as Verified, Missing, or Damaged</p>
        </div>
        <button className="btn-primary" style={{ background: "#ef4444" }} onClick={closeCycle}>
          <Lock size={15} /> Close Cycle
        </button>
      </div>

      {/* Progress bar */}
      <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.625rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Verification Progress</span>
          <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{verified} / {total} assets</span>
        </div>
        <div style={{ background: "var(--bg-base)", borderRadius: 999, height: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 999, transition: "width 0.4s" }} />
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.875rem" }}>
          {["VERIFIED", "MISSING", "DAMAGED", "PENDING"].map(v => {
            const count = items.filter((i: any) => i.verification === v).length;
            const colors: Record<string, string> = { VERIFIED: "#10b981", MISSING: "#ef4444", DAMAGED: "#f59e0b", PENDING: "#6b7280" };
            return <div key={v} style={{ fontSize: "0.78rem", color: colors[v] }}><strong>{count}</strong> {v}</div>;
          })}
        </div>
      </div>

      {/* Items list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {items.map((item: any) => (
          <div key={item.id} className="glass-card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--accent)" }}>{item.asset?.assetTag}</span>
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.asset?.name}</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                Expected location: {item.expectedLocation || "—"}
                {item.verifiedBy && <span style={{ marginLeft: "0.75rem" }}>Verified by: {item.verifiedBy.name}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {VERIFICATION_OPTS.map(({ value, label, icon: Icon, color }) => {
                const active = item.verification === value;
                return (
                  <button key={value} onClick={() => verify(item.id, value)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem", borderRadius: "var(--radius-md)",
                      border: `1px solid ${active ? color : "var(--border)"}`, background: active ? `${color}22` : "var(--bg-base)",
                      color: active ? color : "var(--text-secondary)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s"
                    }}>
                    <Icon size={13} />{label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {!items.length && (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No items in this audit cycle.</div>
        )}
      </div>
    </div>
  );
}
