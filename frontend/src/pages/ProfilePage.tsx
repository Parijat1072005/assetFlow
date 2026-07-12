
import { useAuth } from "../context/AuthContext";
import { Shield, Mail, Key, User } from "lucide-react";

const ROLE_BADGE: Record<string, string> = {
  EMPLOYEE: "badge-gray", DEPARTMENT_HEAD: "badge-blue",
  ASSET_MANAGER: "badge-purple", ADMIN: "badge-red",
};

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>My Profile</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Your account information and role</p>
      </div>

      <div className="glass-card" style={{ padding: "1.75rem" }}>
        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "var(--accent-glow)", border: "2px solid var(--border-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", fontWeight: 800, color: "#a5b4fc"
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{user?.name}</div>
            <span className={`badge ${ROLE_BADGE[user?.role || "EMPLOYEE"]}`} style={{ marginTop: "0.35rem" }}>
              <Shield size={10} style={{ marginRight: 3 }} />
              {user?.role?.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{ width: 36, height: 36, background: "rgba(99,102,241,0.1)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={16} style={{ color: "#a5b4fc" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Name</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user?.name}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{ width: 36, height: 36, background: "rgba(16,185,129,0.1)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mail size={16} style={{ color: "#10b981" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{ width: 36, height: 36, background: "rgba(99,102,241,0.1)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={16} style={{ color: "#a5b4fc" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user?.role?.replace(/_/g, " ")}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{ width: 36, height: 36, background: "rgba(245,158,11,0.1)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Key size={16} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>User ID</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--text-secondary)" }}>{user?.id}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Role permissions note */}
      <div style={{ marginTop: "1.25rem", padding: "1rem 1.25rem", background: "rgba(99,102,241,0.06)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-md)" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          <strong style={{ color: "#a5b4fc" }}>Role changes</strong> must be made by an Administrator via the Employees page. Contact your system admin if you need elevated access.
        </p>
      </div>
    </div>
  );
}
