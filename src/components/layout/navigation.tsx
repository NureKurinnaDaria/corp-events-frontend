import type { ReactNode } from "react";
import {
  CalendarIcon,
  CheckSquareIcon,
  UserIcon,
  TagIcon,
  BarChartIcon,
  ArchiveIcon,
} from "../common/icons";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export const employeeNav: NavItem[] = [
  { to: "/events", label: "Події", icon: <CalendarIcon /> },
  {
    to: "/my-registrations",
    label: "Мої реєстрації",
    icon: <CheckSquareIcon />,
  },
  { to: "/profile", label: "Профіль", icon: <UserIcon /> },
];

export const adminNav: NavItem[] = [
  { to: "/admin/events", label: "Події", icon: <CalendarIcon /> },
  { to: "/admin/categories", label: "Категорії", icon: <TagIcon /> },
  { to: "/admin/analytics", label: "Аналітика", icon: <BarChartIcon /> },
  { to: "/admin/archive", label: "Архів", icon: <ArchiveIcon /> },
  { to: "/profile", label: "Профіль", icon: <UserIcon /> },
];
