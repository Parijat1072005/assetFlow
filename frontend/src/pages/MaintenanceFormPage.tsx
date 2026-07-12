import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import { ArrowLeft, Wrench } from "lucide-react";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export default function MaintenanceFormPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preAssetId = params.get("assetId") || "";

  const [form, setForm] = useState({ assetId: preAssetId, issueDescription: "", priority: "MEDIUM", photoUrl: "" });
  const [loading, setLoading] = useState(false);

  const { data: assets = [] } = useQuery({
    queryKey: ["assets-all"],
    queryFn: () => api.get("/assets").then(r => r.data.data),
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/maintenance", {
        assetId: form.assetId,
        issueDescription: form.issueDescription,
        priority: form.priority,
        photoUrl: form.photoUrl || undefined,
      });
      toast.success("Maintenance request raised!");
      navigate("/maintenance");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to raise maintenance request");
    } finally { setLoading(false); }
  };

  const PRIORITY_COLORS: Record<string, string> = { LOW: "#10b981", MEDIUM: "#3b82f6", HIGH: "#f59e0b", CRITICAL: "#ef4444" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={() => navigate("/maintenance")} className="btn-secondary" style={{ padding: "0.5rem" }}><ArrowLeft size={16} /></button>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Raise Maintenance Request</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.2rem" }}>Report a fault or maintenance need for an asset</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        <div className="glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="label">Asset <span style={{ color: "var(--danger)" }}>*</span></label>
            <select className="select" name="assetId" value={form.assetId} onChange={handle} required>
              <option value="">— Select asset —</option>
              {assets.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Priority</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.5rem" }}>
              {PRIORITIES.map(p => {
                const active = form.priority === p;
                const color = PRIORITY_COLORS[p];
                return (
                  <label key={p} style={{ cursor: "pointer" }}>
                    <input type="radio" name="priority" value={p} checked={active} onChange={handle} style={{ display: "none" }} />
                    <div style={{
                      textAlign: "center", padding: "0.5rem 0.375rem", borderRadius: "var(--radius-md)", border: `1px solid ${active ? color : "var(--border)"}`,
                      background: active ? `${color}22` : "var(--bg-base)", color: active ? color : "var(--text-secondary)",
                      fontSize: "0.75rem", fontWeight: 600, transition: "all 0.15s"
                    }}>
                      {p}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">Issue Description <span style={{ color: "var(--danger)" }}>*</span></label>
            <textarea
              className="input" name="issueDescription" value={form.issueDescription} onChange={handle}
              placeholder="Describe the problem in detail…"
              rows={4} required minLength={10} style={{ resize: "vertical" }}
            />
          </div>

          <div>
            <label className="label">Photo URL (optional)</label>
            <input className="input" name="photoUrl" value={form.photoUrl} onChange={handle} placeholder="https://…" type="url" />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "0.75rem 1.5rem" }}>
            <Wrench size={16} />{loading ? "Submitting..." : "Raise Request"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate("/maintenance")} style={{ padding: "0.75rem 1.5rem" }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
