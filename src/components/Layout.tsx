import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const CalendarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const UserIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const TagIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const BarChartIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const employeeNav: NavItem[] = [
  { to: "/events", label: "Події", icon: <CalendarIcon /> },
  { to: "/my-registrations", label: "Мої реєстрації", icon: <CheckIcon /> },
  { to: "/profile", label: "Профіль", icon: <UserIcon /> },
];

const adminNav: NavItem[] = [
  { to: "/admin/events", label: "Події", icon: <CalendarIcon /> },
  { to: "/admin/categories", label: "Категорії", icon: <TagIcon /> },
  { to: "/admin/analytics", label: "Аналітика", icon: <BarChartIcon /> },
  { to: "/profile", label: "Профіль", icon: <UserIcon /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = user?.role === "ADMIN" ? adminNav : employeeNav;

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className="bg-slate-700 flex flex-col flex-shrink-0 transition-all duration-300"
        style={{ width: collapsed ? "64px" : "280px" }}
      >
        {/* Logo + toggle */}
        <div className="px-3 py-4 border-b border-white/10 flex items-center justify-between gap-2">
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="6" height="6" rx="1" fill="white" />
                  <rect
                    x="11"
                    y="3"
                    width="6"
                    height="6"
                    rx="1"
                    fill="white"
                    opacity="0.6"
                  />
                  <rect
                    x="3"
                    y="11"
                    width="6"
                    height="6"
                    rx="1"
                    fill="white"
                    opacity="0.6"
                  />
                  <rect
                    x="11"
                    y="11"
                    width="6"
                    height="6"
                    rx="1"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-white font-medium text-sm whitespace-nowrap">
                Corp Events
              </span>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="6" height="6" rx="1" fill="white" />
                <rect
                  x="11"
                  y="3"
                  width="6"
                  height="6"
                  rx="1"
                  fill="white"
                  opacity="0.6"
                />
                <rect
                  x="3"
                  y="11"
                  width="6"
                  height="6"
                  rx="1"
                  fill="white"
                  opacity="0.6"
                />
                <rect x="11" y="11" width="6" height="6" rx="1" fill="white" />
              </svg>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="text-white/40 hover:text-white transition flex-shrink-0"
            >
              <ChevronLeftIcon />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {!collapsed && (
            <p className="text-white/30 text-xs font-medium px-2 mb-2 uppercase tracking-widest">
              {user?.role === "ADMIN" ? "Управління" : "Головне"}
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

          {/* Профіль окремо */}
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

        {/* Bottom */}
        <div className="px-2 py-4 border-t border-white/10 space-y-2">
          {/* Expand button when collapsed */}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full flex justify-center py-2 text-white/40 hover:text-white transition"
            >
              <ChevronRightIcon />
            </button>
          )}

          {/* User block */}
          <div
            className={`flex items-center gap-3 px-2 ${collapsed ? "justify-center" : ""}`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {user?.fullName || "Користувач"}
                </p>
                <p className="text-white/40 text-xs">
                  {user?.role === "ADMIN" ? "Адміністратор" : "Співробітник"}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="text-white/40 hover:text-white transition flex-shrink-0"
                title="Вийти"
              >
                <LogoutIcon />
              </button>
            )}
            {collapsed && (
              <button onClick={handleLogout} className="hidden" title="Вийти">
                <LogoutIcon />
              </button>
            )}
          </div>

          {/* Logout when collapsed */}
          {collapsed && (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 text-white/40 hover:text-red-400 transition"
              title="Вийти"
            >
              <LogoutIcon />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
