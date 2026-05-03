import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SidebarLogo from "./SidebarLogo";
import SidebarNav from "./SidebarNav";
import SidebarUserPanel from "./SidebarUserPanel";
import { adminNav, employeeNav } from "./navigation";

interface SidebarProps {
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
}

export default function Sidebar({
  collapsed,
  onCollapse,
  onExpand,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === "ADMIN" ? adminNav : employeeNav;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className="bg-slate-700 flex flex-col flex-shrink-0 transition-all duration-300"
      style={{ width: collapsed ? "64px" : "280px" }}
    >
      <SidebarLogo collapsed={collapsed} onCollapse={onCollapse} />
      <SidebarNav role={user?.role} collapsed={collapsed} navItems={navItems} />
      <SidebarUserPanel
        user={user}
        collapsed={collapsed}
        onExpand={onExpand}
        onLogout={handleLogout}
      />
    </aside>
  );
}
