import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import { ArrowLeft, ClipboardList } from "lucide-react";

export default function AllocateAssetPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preselectedAssetId = params.get("assetId") || "";

  const [form, setForm] = useState({
    assetId: preselectedAssetId,
    holderType: "EMPLOYEE",
    holderEmployeeId: "",
    holderDepartmentId: "",
    expectedReturnDate: "",
  });
  const [loading, setLoading] = useState(false);

  const { data: assets = [] } = useQuery({
    queryKey: ["assets-available"],
    queryFn: () => api.get("/assets?status=AVAILABLE").then(r => r.data.data),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.get("/employees").then(r => r.data.data),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get("/departments").then(r => r.data.data),
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        assetId: form.assetId,
        holderType: form.holderType,
        expectedReturnDate: form.expectedReturnDate ? new Date(form.expectedReturnDate).toISOString() : undefined,
      };
      if (form.holderType === "EMPLOYEE") payload.holderEmployeeId = form.holderEmployeeId;
      else payload.holderDepartmentId = form.holderDepartmentId;

      await api.post("/allocations", payload);
      toast.success("Asset allocated successfully!");
      navigate("/allocations");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to allocate asset");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={() => navigate("/allocations")} className="btn-secondary" style={{ padding: "0.5rem" }}><ArrowLeft size={16} /></button>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Allocate Asset</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.2rem" }}>Assign an available asset to an employee or department</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        <div className="glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="label">Asset <span style={{ color: "var(--danger)" }}>*</span></label>
            <select className="select" name="assetId" value={form.assetId} onChange={handle} required>
              <option value="">— Select available asset —</option>
              {assets.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Allocate To</label>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {["EMPLOYEE", "DEPARTMENT"].map(t => (
                <label key={t} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", flex: 1, padding: "0.625rem 0.875rem", background: form.holderType === t ? "var(--accent-glow)" : "var(--bg-base)", border: `1px solid ${form.holderType === t ? "var(--border-accent)" : "var(--border)"}`, borderRadius: "var(--radius-md)" }}>
                  <input type="radio" name="holderType" value={t} checked={form.holderType === t} onChange={handle} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{t === "EMPLOYEE" ? "👤 Employee" : "🏢 Department"}</span>
                </label>
              ))}
            </div>
          </div>

          {form.holderType === "EMPLOYEE" ? (
            <div>
              <label className="label">Employee <span style={{ color: "var(--danger)" }}>*</span></label>
              <select className="select" name="holderEmployeeId" value={form.holderEmployeeId} onChange={handle} required>
                <option value="">— Select employee —</option>
                {employees.map((e: any) => (
                  <option key={e.id} value={e.id}>{e.name} — {e.email}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="label">Department <span style={{ color: "var(--danger)" }}>*</span></label>
              <select className="select" name="holderDepartmentId" value={form.holderDepartmentId} onChange={handle} required>
                <option value="">— Select department —</option>
                {departments.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">Expected Return Date (optional)</label>
            <input className="input" type="date" name="expectedReturnDate" value={form.expectedReturnDate} onChange={handle} style={{ colorScheme: "light" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "0.75rem 1.5rem" }}>
            <ClipboardList size={16} />{loading ? "Allocating..." : "Allocate Asset"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate("/allocations")} style={{ padding: "0.75rem 1.5rem" }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
