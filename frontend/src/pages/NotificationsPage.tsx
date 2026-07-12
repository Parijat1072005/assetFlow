import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import { Bell, Check, CheckCheck, Package, Wrench, Calendar, AlertTriangle, Info } from "lucide-react";

const TYPE_ICON: Record<string, any> = {
  OVERDUE_RETURN: AlertTriangle,
  BOOKING_REMINDER: Calendar,
  MAINTENANCE_UPDATE: Wrench,
  ALLOCATION_UPDATE: Package,
  SYSTEM: Info,
};

const TYPE_COLOR: Record<string, string> = {
  OVERDUE_RETURN: "#ef4444", BOOKING_REMINDER: "#3b82f6",
  MAINTENANCE_UPDATE: "#f59e0b", ALLOCATION_UPDATE: "#10b981", SYSTEM: "#6366f1",
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications").then(r => r.data.data),
  });

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      qc.invalidateQueries({ queryKey: ["notifications"] });
    } catch { /* silent */ }
  };

  const markAll = async () => {
    try {
      await api.patch("/notifications/read-all");
      toast.success("All notifications marked as read");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    } catch { toast.error("Failed to mark all as read"); }
  };

  const unreadCount = notifications.filter((n: any) => !n.readAt).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Notifications</h1>
            {unreadCount > 0 && (
              <span style={{ background: "var(--danger)", color: "#fff", borderRadius: 999, padding: "1px 8px", fontSize: "0.72rem", fontWeight: 700 }}>{unreadCount}</span>
            )}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Your activity feed and system alerts</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-secondary" onClick={markAll}>
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading notifications…</div>
      ) : !notifications.length ? (
        <div style={{ padding: "5rem", textAlign: "center" }}>
          <Bell size={40} style={{ margin: "0 auto 1rem", display: "block", opacity: 0.2 }} />
          <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>You're all caught up!</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>No notifications yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {notifications.map((n: any) => {
            const Icon = TYPE_ICON[n.type] || Bell;
            const color = TYPE_COLOR[n.type] || "#6366f1";
            const isUnread = !n.readAt;
            return (
              <div key={n.id} onClick={() => isUnread && markRead(n.id)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1rem 1.25rem",
                  background: isUnread ? "rgba(99,102,241,0.05)" : "var(--bg-card)",
                  border: `1px solid ${isUnread ? "var(--border-accent)" : "var(--border)"}`,
                  borderRadius: "var(--radius-md)", cursor: isUnread ? "pointer" : "default",
                  transition: "border-color 0.15s"
                }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontWeight: isUnread ? 700 : 500, fontSize: "0.875rem" }}>{n.title}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", flexShrink: 0, marginLeft: "1rem" }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>{n.message}</p>
                </div>
                {isUnread && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
