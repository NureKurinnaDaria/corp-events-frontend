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
    <nav className="flex-1 px-2 py-4 space-y-1">
      {!collapsed && (
        <p className="text-white/30 text-xs font-medium px-2 mb-2 uppercase tracking-widest">
          {role === "ADMIN" ? "Управління" : "Головне"}
        </p>
      )}

      {navItems.slice(0, -1).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              collapsed ? "justify-center" : ""
            } ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`
          }
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {!collapsed && <span>{item.label}</span>}
        </NavLink>
      ))}

      <div className="pt-3">
        {!collapsed && (
          <p className="text-white/30 text-xs font-medium px-2 mb-2 uppercase tracking-widest">
            Акаунт
          </p>
        )}

        {collapsed && <div className="border-t border-white/10 mb-2" />}

        <NavLink
          to="/profile"
          title={collapsed ? "Профіль" : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              collapsed ? "justify-center" : ""
            } ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`
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
