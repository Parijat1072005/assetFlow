import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import { Tag, Plus, X } from "lucide-react";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 480, padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then(r => r.data.data),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/categories", { name, description: description || undefined, assetTagPrefix: prefix || undefined });
      toast.success("Category created!");
      qc.invalidateQueries({ queryKey: ["categories"] });
      setShowModal(false);
      setName(""); setDescription(""); setPrefix("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create category");
    } finally { setLoading(false); }
  };

  const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#ec4899","#14b8a6"];
  const getColor = (i: number) => COLORS[i % COLORS.length];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Categories</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Define asset types and auto-tag prefixes</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Category</button>
      </div>

      {isLoading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
      ) : !categories.length ? (
        <div style={{ padding: "4rem", textAlign: "center" }}>
          <Tag size={40} style={{ margin: "0 auto 1rem", display: "block", opacity: 0.25 }} />
          <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>No categories yet</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>Create a category before registering assets</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {categories.map((c: any, i: number) => (
            <div key={c.id} className="glass-card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.75rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: `${getColor(i)}22`, border: `1px solid ${getColor(i)}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Tag size={18} style={{ color: getColor(i) }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{c.name}</div>
                  {c.assetTagPrefix && <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: getColor(i), marginTop: "2px" }}>{c.assetTagPrefix}-XXXX</div>}
                </div>
              </div>
              {c.description && <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.625rem" }}>{c.description}</p>}
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{c._count?.assets ?? 0} assets</div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Create Category" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="label">Name <span style={{ color: "var(--danger)" }}>*</span></label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Laptop" required />
            </div>
            <div>
              <label className="label">Asset Tag Prefix</label>
              <input className="input" value={prefix} onChange={e => setPrefix(e.target.value.toUpperCase())} placeholder="e.g. LPT" maxLength={10} />
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>Tags will be auto-generated as: LPT-0001, LPT-0002…</p>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" rows={2} style={{ resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: "center" }}>{loading ? "Creating..." : "Create Category"}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
