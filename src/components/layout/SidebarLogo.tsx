import { AppLogoIcon, ChevronLeftIcon } from "../common/icons";

interface SidebarLogoProps {
  collapsed: boolean;
  onCollapse: () => void;
}

export default function SidebarLogo({
  collapsed,
  onCollapse,
}: SidebarLogoProps) {
  return (
    <div
      className="px-3 py-4 flex items-center justify-between gap-2"
      style={{ borderBottom: "1px solid rgba(59,130,246,0.08)" }}
    >
      {!collapsed && (
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <AppLogoIcon />
          </div>
          <span
            className="text-slate-800 font-semibold text-sm whitespace-nowrap"
            style={{ letterSpacing: "-0.2px" }}
          >
            Corp Events
          </span>
        </div>
      )}

      {collapsed && (
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
          <AppLogoIcon />
        </div>
      )}

      {!collapsed && (
        <button
          onClick={onCollapse}
          className="transition flex-shrink-0 rounded-lg p-1"
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
          <ChevronLeftIcon />
        </button>
      )}
    </div>
  );
}
