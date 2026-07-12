import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Package, Users, Building2, Tag,
  ClipboardList, Wrench, ClipboardCheck, Calendar,
  Bell, LogOut, User
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const navItems = [
  { label: "Dashboard",    icon: LayoutDashboard, to: "/" },
  { label: "Assets",       icon: Package,          to: "/assets" },
  { label: "Allocations",  icon: ClipboardList,    to: "/allocations" },
  { label: "Bookings",     icon: Calendar,         to: "/bookings" },
  { label: "Maintenance",  icon: Wrench,           to: "/maintenance" },
  { label: "Audits",       icon: ClipboardCheck,   to: "/audits" },
];

const orgItems = [
  { label: "Departments", icon: Building2, to: "/departments" },
  { label: "Categories",  icon: Tag,       to: "/categories" },
  { label: "Employees",   icon: Users,     to: "/employees" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications?unreadOnly=true").then(r => r.data.data),
    refetchInterval: 30_000,
  });
  const unreadCount = notifications.length;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: "1.5rem 1.25rem 1rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 800, color: "#fff" }}>A</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>AssetFlow</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Enterprise ERP</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "1rem 0", overflowY: "auto" }}>
        <div style={{ padding: "0 0.75rem", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Operations</span>
        </div>
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Icon size={16} />{label}
          </NavLink>
        ))}

        {/* Notifications with badge */}
        <NavLink to="/notifications" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <Bell size={16} />
          <span style={{ flex: 1 }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{ background: "var(--danger)", color: "#fff", borderRadius: 999, padding: "1px 7px", fontSize: "0.65rem", fontWeight: 700 }}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </NavLink>

        <div style={{ padding: "0.75rem 0.75rem 0.5rem", marginTop: "0.5rem" }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Organization</span>
        </div>
        {orgItems.map(({ label, icon: Icon, to }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Icon size={16} />{label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
        <NavLink to="/profile" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.5rem", borderRadius: "var(--radius-md)", textDecoration: "none", marginBottom: "0.5rem" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-glow)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#a5b4fc", flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{user?.role?.replace(/_/g, " ")}</div>
          </div>
          <User size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        </NavLink>
        <button onClick={logout} className="btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
