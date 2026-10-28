import {
  CalendarDays,
  Compass,
  FolderOpen,
  GraduationCap,
  Home,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Home", short: "Home", icon: Home },
  { href: "/journey", label: "My Journey", short: "Journey", icon: Compass },
  { href: "/projects", label: "Projects", short: "Projects", icon: FolderOpen },
  { href: "/learning", label: "Learning", short: "Learning", icon: GraduationCap },
  { href: "/week", label: "This Week", short: "Week", icon: CalendarDays },
];

export const settingsItem: NavItem = {
  href: "/settings",
  label: "Settings",
  short: "Settings",
  icon: Settings,
};