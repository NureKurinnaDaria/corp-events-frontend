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
    <div className="px-3 py-4 border-b border-white/10 flex items-center justify-between gap-2">
      {!collapsed && (
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <AppLogoIcon />
          </div>
          <span className="text-white font-medium text-sm whitespace-nowrap">
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
          className="text-white/40 hover:text-white transition flex-shrink-0"
        >
          <ChevronLeftIcon />
        </button>
      )}
    </div>
  );
}
