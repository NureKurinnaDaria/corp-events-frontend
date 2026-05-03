import { ChevronRightIcon, LogoutIcon } from "../common/icons";
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
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div className="px-2 py-4 border-t border-white/10 space-y-2">
      {collapsed && (
        <button
          onClick={onExpand}
          className="w-full flex justify-center py-2 text-white/40 hover:text-white transition"
        >
          <ChevronRightIcon />
        </button>
      )}

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
            onClick={onLogout}
            className="text-white/40 hover:text-white transition flex-shrink-0"
            title="Вийти"
          >
            <LogoutIcon />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={onLogout}
          className="w-full flex justify-center py-2 text-white/40 hover:text-red-400 transition"
          title="Вийти"
        >
          <LogoutIcon />
        </button>
      )}
    </div>
  );
}
