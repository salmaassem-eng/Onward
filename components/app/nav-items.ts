import {
  CalendarDays,
  Compass,
  FolderOpen,
  GraduationCap,
  Home,
  Settings,
  Target,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/journey", label: "My Journey", icon: Compass },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/learning", label: "Learning", icon: GraduationCap },
  { href: "/week", label: "This Week", icon: CalendarDays },
];

export const settingsItem = {
  href: "/settings",
  label: "Settings",
  icon: Settings,
};