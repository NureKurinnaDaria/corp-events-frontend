import { NavLink } from "react-router-dom";
import { UserIcon } from "../common/icons";
import type { NavItem } from "./navigation";
import type { Role } from "../../types";

interface SidebarNavProps {
  role: Role | undefined;
  collapsed: boolean;
  navItems: NavItem[];
}

export default function SidebarNav({
  role,
  collapsed,
  navItems,
}: SidebarNavProps) {
  return (
    <nav className="flex-1 px-2 py-4 space-y-0.5">
      {!collapsed && (
        <p
          className="text-xs font-semibold px-3 mb-2 uppercase tracking-widest"
          style={{ color: "#94a3b8", fontSize: "10px" }}
        >
          {role === "ADMIN" ? "Управління" : "Головне"}
        </p>
      )}

      {navItems.slice(0, -1).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${collapsed ? "justify-center" : ""} ${
              isActive ? "active-nav" : "inactive-nav"
            }`
          }
          style={({ isActive }) =>
            isActive
              ? {
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#ffffff",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                }
              : {
                  color: "#64748b",
                  fontWeight: 500,
                }
          }
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {!collapsed && <span>{item.label}</span>}
        </NavLink>
      ))}

      <div className="pt-4">
        {!collapsed && (
          <p
            className="text-xs font-semibold px-3 mb-2 uppercase tracking-widest"
            style={{ color: "#94a3b8", fontSize: "10px" }}
          >
            Акаунт
          </p>
        )}
        {collapsed && (
          <div
            className="my-2"
            style={{ borderTop: "1px solid rgba(59,130,246,0.08)" }}
          />
        )}

        <NavLink
          to="/profile"
          title={collapsed ? "Профіль" : undefined}
          className={({ isActive: _isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${collapsed ? "justify-center" : ""}`
          }
          style={({ isActive }) =>
            isActive
              ? {
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#ffffff",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                }
              : {
                  color: "#64748b",
                  fontWeight: 500,
                }
          }
        >
          <span className="flex-shrink-0">
            <UserIcon />
          </span>
          {!collapsed && <span>Профіль</span>}
        </NavLink>
      </div>
    </nav>
  );
}
