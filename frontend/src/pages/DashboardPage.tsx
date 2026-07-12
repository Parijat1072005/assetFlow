
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  Package, CheckCircle, Wrench, AlertTriangle,
  Calendar, TrendingUp, Clock
} from "lucide-react";

interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  allocatedAssets: number;
  maintenanceAssets: number;
  overdueAllocations: number;
  activeBookings: number;
}

function KpiCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: number; icon: any; color: string; sub?: string;
}) {
  return (
    <div className="kpi-card fade-in-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value" style={{ color }}>{value}</div>
          {sub && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{sub}</div>}
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: "var(--radius-md)",
          background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/dashboard/stats").then(r => r.data.data),
    refetchInterval: 60_000,
  });

  const stats = data;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Here's what's happening across your asset ecosystem today.
        </p>
      </div>

      {/* KPI Grid */}
      {isLoading ? (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem"
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 110, background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <KpiCard label="Total Assets"       value={stats?.totalAssets || 0}        icon={Package}        color="var(--accent)" />
          <KpiCard label="Available"          value={stats?.availableAssets || 0}    icon={CheckCircle}    color="#10b981" />
          <KpiCard label="Allocated"          value={stats?.allocatedAssets || 0}    icon={TrendingUp}     color="#f59e0b" />
          <KpiCard label="Under Maintenance"  value={stats?.maintenanceAssets || 0}  icon={Wrench}         color="#ef4444" />
          <KpiCard label="Overdue Returns"    value={stats?.overdueAllocations || 0} icon={AlertTriangle}  color="#ef4444" sub="Needs attention" />
          <KpiCard label="Bookings Today"     value={stats?.activeBookings || 0}     icon={Calendar}       color="#3b82f6" />
        </div>
      )}

      {/* Quick Links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <QuickPanel title="Recent Allocations" linkTo="/allocations" />
        <QuickPanel title="Pending Maintenance" linkTo="/maintenance" />
      </div>
    </div>
  );
}

function QuickPanel({ title, linkTo }: { title: string; linkTo: string }) {
  return (
    <div className="glass-card" style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>{title}</h3>
        <a href={linkTo} style={{ fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none" }}>View all →</a>
      </div>
      <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", padding: "1rem 0", textAlign: "center" }}>
        <Clock size={20} style={{ margin: "0 auto 0.5rem", display: "block", opacity: 0.4 }} />
        Live data loads from your backend
      </div>
    </div>
  );
}
