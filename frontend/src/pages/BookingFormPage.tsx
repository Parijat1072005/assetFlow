import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import { ArrowLeft, Calendar } from "lucide-react";

export default function BookingFormPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preAssetId = params.get("assetId") || "";

  const [form, setForm] = useState({ assetId: preAssetId, startTime: "", endTime: "", purpose: "" });
  const [loading, setLoading] = useState(false);

  const { data: bookableAssets = [] } = useQuery({
    queryKey: ["bookable-assets"],
    queryFn: () => api.get("/assets?isBookable=true&status=AVAILABLE").then(r => r.data.data),
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.endTime <= form.startTime) {
      toast.error("End time must be after start time");
      return;
    }
    setLoading(true);
    try {
      await api.post("/bookings", {
        assetId: form.assetId,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        purpose: form.purpose || undefined,
      });
      toast.success("Resource booked successfully!");
      navigate("/bookings");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Booking failed — time slot may be taken");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={() => navigate("/bookings")} className="btn-secondary" style={{ padding: "0.5rem" }}><ArrowLeft size={16} /></button>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Book a Resource</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.2rem" }}>Reserve a bookable asset for a specific time slot</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 540 }}>
        <div className="glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="label">Resource <span style={{ color: "var(--danger)" }}>*</span></label>
            <select className="select" name="assetId" value={form.assetId} onChange={handle} required>
              <option value="">— Select bookable resource —</option>
              {bookableAssets.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
              ))}
            </select>
            {!bookableAssets.length && (
              <p style={{ fontSize: "0.75rem", color: "var(--warning)", marginTop: "0.35rem" }}>No bookable assets available. Enable "Allow Booking" on an asset first.</p>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="label">Start Date & Time <span style={{ color: "var(--danger)" }}>*</span></label>
              <input className="input" type="datetime-local" name="startTime" value={form.startTime} onChange={handle} required style={{ colorScheme: "dark" }} />
            </div>
            <div>
              <label className="label">End Date & Time <span style={{ color: "var(--danger)" }}>*</span></label>
              <input className="input" type="datetime-local" name="endTime" value={form.endTime} onChange={handle} required style={{ colorScheme: "dark" }} />
            </div>
          </div>

          <div>
            <label className="label">Purpose (optional)</label>
            <textarea
              className="input" name="purpose" value={form.purpose} onChange={handle}
              placeholder="e.g. Client presentation, Team demo..."
              rows={3} style={{ resize: "vertical" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "0.75rem 1.5rem" }}>
            <Calendar size={16} />{loading ? "Booking..." : "Confirm Booking"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate("/bookings")} style={{ padding: "0.75rem 1.5rem" }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
