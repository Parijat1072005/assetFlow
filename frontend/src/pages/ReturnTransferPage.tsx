import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import { ArrowLeft, ArrowRightLeft, RotateCcw } from "lucide-react";

export default function ReturnTransferPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"return" | "transfer">("return");

  // Return state
  const [returnForm, setReturnForm] = useState({ allocationId: "", checkInCondition: "GOOD", checkInNotes: "" });
  const [returnLoading, setReturnLoading] = useState(false);

  // Transfer state
  const [transferForm, setTransferForm] = useState({ assetId: "", toEmployeeId: "", reason: "" });
  const [transferLoading, setTransferLoading] = useState(false);

  const { data: activeAllocations = [] } = useQuery({
    queryKey: ["allocations-active"],
    queryFn: () => api.get("/allocations?status=ACTIVE").then(r => r.data.data),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.get("/employees").then(r => r.data.data),
  });

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setReturnLoading(true);
    try {
      await api.post(`/allocations/${returnForm.allocationId}/return`, {
        checkInCondition: returnForm.checkInCondition,
        checkInNotes: returnForm.checkInNotes || undefined,
      });
      toast.success("Asset returned successfully!");
      navigate("/allocations");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Return failed");
    } finally { setReturnLoading(false); }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferLoading(true);
    try {
      await api.post("/allocations/transfer", {
        assetId: transferForm.assetId,
        toEmployeeId: transferForm.toEmployeeId,
        reason: transferForm.reason || undefined,
      });
      toast.success("Transfer request submitted!");
      navigate("/allocations");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Transfer failed");
    } finally { setTransferLoading(false); }
  };

  const CONDITIONS = ["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={() => navigate("/allocations")} className="btn-secondary" style={{ padding: "0.5rem" }}><ArrowLeft size={16} /></button>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Return / Transfer Asset</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.2rem" }}>Check in a returned asset or request a transfer</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "4px", width: "fit-content" }}>
        {(["return", "transfer"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: "0.5rem 1.25rem", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer",
              background: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "#fff" : "var(--text-secondary)",
              fontWeight: 600, fontSize: "0.875rem", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "0.4rem"
            }}>
            {t === "return" ? <><RotateCcw size={14} />Return</> : <><ArrowRightLeft size={14} />Transfer</>}
          </button>
        ))}
      </div>

      {tab === "return" ? (
        <form onSubmit={handleReturn} style={{ maxWidth: 520 }}>
          <div className="glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label className="label">Active Allocation <span style={{ color: "var(--danger)" }}>*</span></label>
              <select className="select" value={returnForm.allocationId} onChange={e => setReturnForm(p => ({ ...p, allocationId: e.target.value }))} required>
                <option value="">— Select allocation —</option>
                {activeAllocations.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.asset?.name} ({a.asset?.assetTag}) — {a.holderEmployee?.name || a.holderDepartment?.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Returned Condition</label>
              <select className="select" value={returnForm.checkInCondition} onChange={e => setReturnForm(p => ({ ...p, checkInCondition: e.target.value }))}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea className="input" value={returnForm.checkInNotes} onChange={e => setReturnForm(p => ({ ...p, checkInNotes: e.target.value }))} placeholder="Any remarks on returned condition…" rows={3} style={{ resize: "vertical" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button type="submit" className="btn-primary" disabled={returnLoading} style={{ padding: "0.75rem 1.5rem" }}>
              <RotateCcw size={16} />{returnLoading ? "Processing..." : "Confirm Return"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate("/allocations")} style={{ padding: "0.75rem 1.5rem" }}>Cancel</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleTransfer} style={{ maxWidth: 520 }}>
          <div className="glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label className="label">Asset to Transfer <span style={{ color: "var(--danger)" }}>*</span></label>
              <select className="select" value={transferForm.assetId} onChange={e => setTransferForm(p => ({ ...p, assetId: e.target.value }))} required>
                <option value="">— Select allocated asset —</option>
                {activeAllocations.map((a: any) => (
                  <option key={a.id} value={a.assetId}>
                    {a.asset?.name} ({a.asset?.assetTag}) — held by {a.holderEmployee?.name || a.holderDepartment?.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Transfer To (Employee) <span style={{ color: "var(--danger)" }}>*</span></label>
              <select className="select" value={transferForm.toEmployeeId} onChange={e => setTransferForm(p => ({ ...p, toEmployeeId: e.target.value }))} required>
                <option value="">— Select employee —</option>
                {employees.map((e: any) => (
                  <option key={e.id} value={e.id}>{e.name} — {e.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Reason (optional)</label>
              <textarea className="input" value={transferForm.reason} onChange={e => setTransferForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for transfer…" rows={3} style={{ resize: "vertical" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button type="submit" className="btn-primary" disabled={transferLoading} style={{ padding: "0.75rem 1.5rem" }}>
              <ArrowRightLeft size={16} />{transferLoading ? "Submitting..." : "Request Transfer"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate("/allocations")} style={{ padding: "0.75rem 1.5rem" }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
