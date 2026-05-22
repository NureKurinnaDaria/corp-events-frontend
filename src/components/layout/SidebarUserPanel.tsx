import { ChevronRightIcon, LogoutIcon } from "../common/icons";
import NotificationsBell from "./NotificationsBell";
import type { User } from "../../types";

interface SidebarUserPanelProps {
  user: User | null;
  collapsed: boolean;
  onExpand: () => void;
  onLogout: () => void;
}

export default function SidebarUserPanel({
  user,
  collapsed,
  onExpand,
  onLogout,
}: SidebarUserPanelProps) {
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div
      className="px-2 py-4 space-y-2"
      style={{ borderTop: "1px solid rgba(59,130,246,0.08)" }}
    >
      {collapsed && (
        <button
          onClick={onExpand}
          className="w-full flex justify-center py-2 transition rounded-xl"
          style={{ color: "#94a3b8" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#2563eb";
            e.currentTarget.style.background = "#eff6ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <ChevronRightIcon />
        </button>
      )}

      <div
        className={`flex items-center gap-3 px-2 ${collapsed ? "justify-center" : ""}`}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initials
          )}
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold truncate"
              style={{ color: "#1e293b" }}
            >
              {user?.fullName || "Користувач"}
            </p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              {user?.role === "ADMIN" ? "Адміністратор" : "Співробітник"}
            </p>
          </div>
        )}

        {!collapsed && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <NotificationsBell />
            <button
              onClick={onLogout}
              className="transition rounded-lg p-1"
              style={{ color: "#94a3b8" }}
              title="Вийти"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#e11d48";
                e.currentTarget.style.background = "#fff1f2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <LogoutIcon />
            </button>
          </div>
        )}
      </div>

      {collapsed && (
        <div className="flex flex-col items-center gap-1">
          <NotificationsBell />
          <button
            onClick={onLogout}
            className="w-full flex justify-center py-2 transition rounded-xl"
            style={{ color: "#94a3b8" }}
            title="Вийти"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#e11d48";
              e.currentTarget.style.background = "#fff1f2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogoutIcon />
          </button>
        </div>
      )}
    </div>
  );
}
