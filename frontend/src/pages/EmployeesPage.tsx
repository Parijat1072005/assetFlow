import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import { Users, Search, UserCheck, UserX, Shield } from "lucide-react";

const ROLE_BADGE: Record<string, string> = {
  EMPLOYEE: "badge-gray", DEPARTMENT_HEAD: "badge-blue",
  ASSET_MANAGER: "badge-purple", ADMIN: "badge-red",
};
const ROLES = ["EMPLOYEE", "DEPARTMENT_HEAD", "ASSET_MANAGER", "ADMIN"];

export default function EmployeesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [promoting, setPromoting] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees", search],
    queryFn: () => api.get(`/employees?search=${search}`).then(r => r.data.data),
    placeholderData: [],
  });

  const promote = async (id: string) => {
    const role = selectedRole[id];
    if (!role) return;
    setPromoting(id);
    try {
      await api.patch(`/employees/${id}/role`, { role });
      toast.success("Role updated successfully");
      qc.invalidateQueries({ queryKey: ["employees"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    } finally { setPromoting(null); }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const action = currentStatus === "ACTIVE" ? "deactivate" : "activate";
    try {
      await api.patch(`/employees/${id}/status`, { status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
      toast.success(`Employee ${action}d`);
      qc.invalidateQueries({ queryKey: ["employees"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Employees</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Manage users, roles and access levels</p>
      </div>

      <div style={{ position: "relative", maxWidth: 360, marginBottom: "1.25rem" }}>
        <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input className="input" style={{ paddingLeft: "2.25rem" }} placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
        ) : !employees.length ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Users size={36} style={{ margin: "0 auto 0.75rem", display: "block", opacity: 0.3 }} />
            <p style={{ color: "var(--text-muted)" }}>No employees found</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Current Role</th>
                <th>Status</th>
                <th>Change Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp: any) => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-glow)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#a5b4fc", flexShrink: 0 }}>
                        {emp.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{emp.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{emp.department?.name ?? "—"}</td>
                  <td><span className={`badge ${ROLE_BADGE[emp.role]}`}><Shield size={9} style={{ marginRight: 3 }} />{emp.role.replace("_", " ")}</span></td>
                  <td><span className={`badge ${emp.status === "ACTIVE" ? "badge-green" : "badge-red"}`}>{emp.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <select className="select" style={{ width: "auto", padding: "0.35rem 0.625rem", fontSize: "0.78rem" }}
                        value={selectedRole[emp.id] || emp.role}
                        onChange={e => setSelectedRole(prev => ({ ...prev, [emp.id]: e.target.value }))}>
                        {ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                      </select>
                      <button className="btn-primary" style={{ padding: "0.35rem 0.625rem", fontSize: "0.78rem" }}
                        disabled={promoting === emp.id || selectedRole[emp.id] === emp.role || !selectedRole[emp.id]}
                        onClick={() => promote(emp.id)}>
                        {promoting === emp.id ? "…" : "Apply"}
                      </button>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleStatus(emp.id, emp.status)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: emp.status === "ACTIVE" ? "var(--danger)" : "var(--success)", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 500 }}>
                      {emp.status === "ACTIVE" ? <><UserX size={14} />Deactivate</> : <><UserCheck size={14} />Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
