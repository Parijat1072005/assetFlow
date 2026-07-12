import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import { Building2, Plus, X, Users } from "lucide-react";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
    }}>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 480,
        padding: "1.75rem"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [parentDeptId, setParentDeptId] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get("/departments").then(r => r.data.data),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/departments", { name, parentDeptId: parentDeptId || undefined });
      toast.success("Department created!");
      qc.invalidateQueries({ queryKey: ["departments"] });
      setShowModal(false);
      setName(""); setParentDeptId("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Departments</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Manage your organizational structure</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Department
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
      ) : !departments.length ? (
        <div style={{ padding: "4rem", textAlign: "center" }}>
          <Building2 size={40} style={{ margin: "0 auto 1rem", display: "block", opacity: 0.25 }} />
          <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>No departments yet</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {departments.map((d: any) => (
            <div key={d.id} className="glass-card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "var(--radius-md)",
                  background: "var(--accent-glow)", border: "1px solid var(--border-accent)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <Building2 size={18} style={{ color: "var(--accent)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.25rem" }}>{d.name}</div>
                  {d.head && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Head: {d.head.name}</div>
                  )}
                  {d.parentDept && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Under: {d.parentDept.name}</div>
                  )}
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.625rem" }}>
                    <span className={`badge ${d.status === "ACTIVE" ? "badge-green" : "badge-gray"}`}>{d.status}</span>
                    <span className="badge badge-gray" style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Users size={10} /> {d._count?.members ?? 0} members
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Create Department" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label">Department Name <span style={{ color: "var(--danger)" }}>*</span></label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Engineering" required />
            </div>
            <div>
              <label className="label">Parent Department (optional)</label>
              <select className="select" value={parentDeptId} onChange={e => setParentDeptId(e.target.value)}>
                <option value="">— None (top-level) —</option>
                {departments.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: "center" }}>
                {loading ? "Creating..." : "Create Department"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
