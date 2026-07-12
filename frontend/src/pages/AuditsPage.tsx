import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import { ClipboardCheck, Plus, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 480, padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Start Audit Cycle</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AuditsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const canStart = user?.role === "ADMIN" || user?.role === "ASSET_MANAGER";

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", scheduledDate: "", departmentId: "" });
  const [loading, setLoading] = useState(false);

  const { data: cycles = [], isLoading } = useQuery({
    queryKey: ["audit-cycles"],
    queryFn: () => api.get("/audits").then(r => r.data.data),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get("/departments").then(r => r.data.data),
  });

  const startCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        title: form.title,
        scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : undefined,
        departmentId: form.departmentId || undefined,
      };
      const res = await api.post("/audits", payload);
      toast.success("Audit cycle started!");
      qc.invalidateQueries({ queryKey: ["audit-cycles"] });
      setShowModal(false);
      navigate(`/audits/${res.data.data.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start audit");
    } finally { setLoading(false); }
  };

  const pct = (c: any) => {
    if (!c.totalItems) return 0;
    return Math.round(((c.verifiedCount || 0) / c.totalItems) * 100);
  };

  const STATUS_COLOR: Record<string, string> = {
    OPEN: "#3b82f6", IN_PROGRESS: "#f59e0b", COMPLETED: "#10b981", CANCELLED: "#6b7280"
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Audits</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Physical verification cycles for the asset registry</p>
        </div>
        {canStart && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Start Audit Cycle
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading audits…</div>
      ) : !cycles.length ? (
        <div style={{ padding: "4rem", textAlign: "center" }}>
          <ClipboardCheck size={40} style={{ margin: "0 auto 1rem", display: "block", opacity: 0.25 }} />
          <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>No audit cycles yet</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {cycles.map((c: any) => {
            const p = pct(c);
            const color = STATUS_COLOR[c.status] || "#6b7280";
            return (
              <div key={c.id} className="glass-card" style={{ padding: "1.25rem", cursor: "pointer" }} onClick={() => navigate(`/audits/${c.id}`)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.875rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{c.title}</span>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color, background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 999, padding: "2px 8px" }}>{c.status}</span>
                </div>
                {c.department && <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.625rem" }}>Dept: {c.department.name}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "0.625rem" }}>
                  <span>{c.verifiedCount || 0} / {c.totalItems || 0} verified</span>
                  <span>{p}%</span>
                </div>
                <div style={{ background: "var(--bg-base)", borderRadius: 999, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p}%`, background: color, borderRadius: 999, transition: "width 0.4s" }} />
                </div>
                {c.scheduledDate && (
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.625rem" }}>
                    Scheduled: {new Date(c.scheduledDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <form onSubmit={startCycle} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label">Cycle Title <span style={{ color: "var(--danger)" }}>*</span></label>
              <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Q3 2026 Audit" required />
            </div>
            <div>
              <label className="label">Scheduled Date</label>
              <input className="input" type="date" value={form.scheduledDate} onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))} style={{ colorScheme: "light" }} />
            </div>
            <div>
              <label className="label">Scope: Department (leave blank for full org)</label>
              <select className="select" value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}>
                <option value="">— All departments —</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: "center" }}>{loading ? "Starting..." : "Start Cycle"}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
