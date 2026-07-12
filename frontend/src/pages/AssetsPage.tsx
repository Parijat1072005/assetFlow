import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { Package, Plus, Search, Filter } from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    AVAILABLE: "badge-green", ALLOCATED: "badge-yellow",
    UNDER_MAINTENANCE: "badge-red", RESERVED: "badge-blue",
    LOST: "badge-red", RETIRED: "badge-gray", DISPOSED: "badge-gray",
  };
  return `badge ${map[status] || "badge-gray"}`;
}

function conditionBadge(cond: string) {
  const map: Record<string, string> = {
    NEW: "badge-green", GOOD: "badge-green", FAIR: "badge-yellow",
    POOR: "badge-yellow", DAMAGED: "badge-red",
  };
  return `badge ${map[cond] || "badge-gray"}`;
}

export default function AssetsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["assets", search],
    queryFn: () => api.get(`/assets?search=${search}`).then(r => r.data.data),
    placeholderData: [],
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Asset Directory</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            All registered assets across the organization
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/assets/new")}>
          <Plus size={16} />
          Register Asset
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            className="input" style={{ paddingLeft: "2.25rem" }}
            placeholder="Search by name, tag, serial..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-secondary"><Filter size={14} /> Filters</button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading assets…</div>
        ) : !data?.length ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Package size={36} style={{ margin: "0 auto 0.75rem", display: "block", opacity: 0.3 }} />
            <p style={{ color: "var(--text-muted)" }}>No assets found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th><th>Name</th><th>Category</th>
                <th>Department</th><th>Status</th><th>Condition</th><th>Location</th>
              </tr>
            </thead>
            <tbody>
              {data.map((asset: any) => (
                <tr key={asset.id} onClick={() => navigate(`/assets/${asset.id}`)} style={{ cursor: "pointer" }}>
                  <td><span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#a5b4fc", fontWeight: 600 }}>{asset.assetTag}</span></td>
                  <td style={{ fontWeight: 500 }}>{asset.name}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{asset.category?.name || "—"}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{asset.department?.name || "—"}</td>
                  <td><span className={statusBadge(asset.status)}>{asset.status.replace("_", " ")}</span></td>
                  <td><span className={conditionBadge(asset.condition)}>{asset.condition}</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{asset.location || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
