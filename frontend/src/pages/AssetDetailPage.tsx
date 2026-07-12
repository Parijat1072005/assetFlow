import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { ArrowLeft, Package, MapPin, Calendar, DollarSign, QrCode, Wrench, ClipboardList, History } from "lucide-react";

function statusBadge(s: string) {
  const m: Record<string, string> = { AVAILABLE: "badge-green", ALLOCATED: "badge-yellow", UNDER_MAINTENANCE: "badge-red", RESERVED: "badge-blue", LOST: "badge-red", RETIRED: "badge-gray", DISPOSED: "badge-gray" };
  return `badge ${m[s] || "badge-gray"}`;
}
function condBadge(s: string) {
  const m: Record<string, string> = { NEW: "badge-green", GOOD: "badge-green", FAIR: "badge-yellow", POOR: "badge-yellow", DAMAGED: "badge-red" };
  return `badge ${m[s] || "badge-gray"}`;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.625rem 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{value || "—"}</span>
    </div>
  );
}

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: asset, isLoading } = useQuery({
    queryKey: ["asset", id],
    queryFn: () => api.get(`/assets/${id}`).then(r => r.data.data),
  });

  const { data: allocations = [] } = useQuery({
    queryKey: ["asset-allocations", id],
    queryFn: () => api.get(`/allocations?assetId=${id}`).then(r => r.data.data),
    enabled: !!id,
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ["asset-maintenance", id],
    queryFn: () => api.get(`/maintenance?assetId=${id}`).then(r => r.data.data),
    enabled: !!id,
  });

  if (isLoading) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>Loading asset…</div>;
  if (!asset) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--danger)" }}>Asset not found.</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={() => navigate("/assets")} className="btn-secondary" style={{ padding: "0.5rem" }}><ArrowLeft size={16} /></button>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>{asset.name}</h1>
            <span className={statusBadge(asset.status)}>{asset.status.replace("_", " ")}</span>
          </div>
          <div style={{ display: "flex", align: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
            <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#a5b4fc" }}>{asset.assetTag}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Details card */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Asset Details</h2>
          <InfoRow label="Category" value={asset.category?.name} />
          <InfoRow label="Department" value={asset.department?.name} />
          <InfoRow label="Condition" value={<span className={condBadge(asset.condition)}>{asset.condition}</span>} />
          <InfoRow label="Location" value={<span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{asset.location}</span>} />
          <InfoRow label="Serial Number" value={<span style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{asset.serialNumber}</span>} />
          <InfoRow label="QR Code" value={<span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#a5b4fc" }}>{asset.qrCode}</span>} />
          <InfoRow label="Acquisition Date" value={asset.acquisitionDate ? new Date(asset.acquisitionDate).toLocaleDateString() : null} />
          <InfoRow label="Acquisition Cost" value={asset.acquisitionCost ? `₹${Number(asset.acquisitionCost).toLocaleString()}` : null} />
          <InfoRow label="Bookable" value={asset.isBookable ? <span className="badge badge-green">Yes</span> : <span className="badge badge-gray">No</span>} />
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {asset.status === "AVAILABLE" && (
            <div className="glass-card" style={{ padding: "1.25rem" }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Quick Actions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <button className="btn-primary" style={{ justifyContent: "center" }} onClick={() => navigate(`/allocations/new?assetId=${id}`)}>
                  <ClipboardList size={15} /> Allocate Asset
                </button>
                {asset.isBookable && (
                  <button className="btn-secondary" style={{ justifyContent: "center" }} onClick={() => navigate(`/bookings/new?assetId=${id}`)}>
                    <Calendar size={15} /> Book Resource
                  </button>
                )}
                <button className="btn-secondary" style={{ justifyContent: "center" }} onClick={() => navigate(`/maintenance/new?assetId=${id}`)}>
                  <Wrench size={15} /> Raise Maintenance
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Allocation history */}
      <div className="glass-card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <History size={14} style={{ display: "inline", marginRight: 6 }} />Allocation History
        </h2>
        {!allocations.length ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No allocation history.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Holder</th><th>Type</th><th>Allocated</th><th>Returned</th><th>Status</th></tr>
            </thead>
            <tbody>
              {allocations.map((a: any) => (
                <tr key={a.id}>
                  <td>{a.holderEmployee?.name || a.holderDepartment?.name || "—"}</td>
                  <td><span className="badge badge-gray">{a.holderType}</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{new Date(a.allocatedDate).toLocaleDateString()}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{a.returnedDate ? new Date(a.returnedDate).toLocaleDateString() : "—"}</td>
                  <td><span className={`badge ${a.status === "ACTIVE" ? "badge-green" : "badge-gray"}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Maintenance history */}
      <div className="glass-card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <Wrench size={14} style={{ display: "inline", marginRight: 6 }} />Maintenance History
        </h2>
        {!maintenance.length ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No maintenance records.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Issue</th><th>Priority</th><th>Status</th><th>Raised By</th><th>Date</th></tr>
            </thead>
            <tbody>
              {maintenance.map((m: any) => (
                <tr key={m.id}>
                  <td style={{ maxWidth: 200 }}>{m.issueDescription}</td>
                  <td><span className={`badge ${m.priority === "CRITICAL" ? "badge-red" : m.priority === "HIGH" ? "badge-yellow" : "badge-gray"}`}>{m.priority}</span></td>
                  <td><span className="badge badge-blue">{m.status}</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{m.raisedBy?.name}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
