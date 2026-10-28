"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import type { SessionUser } from "@/lib/session";
import Avatar from "./Avatar";
import LogoutButton from "./LogoutButton";
import { navItems, settingsItem, type NavItem } from "./nav-items";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition ${
        active
          ? "bg-green-50 text-green-700"
          : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
      }`}
    >
      <Icon className="h-5 w-5" />
      {item.label}
      {active && <span className="ml-auto h-2 w-2 rounded-full bg-green-500" />}
    </Link>
  );
}

export default function AppSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
      <div className="px-6 pb-4 pt-8">
        <Logo variant="onLight" size="md" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>

      <div className="border-t border-stone-200 px-3 py-4">
        <NavLink item={settingsItem} active={isActive(settingsItem.href)} />

        <LogoutButton className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-stone-600 transition hover:bg-red-50 hover:text-red-600">
          <LogOut className="h-5 w-5" />
          Log out
        </LogoutButton>

        <Link
          href="/settings"
          className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-stone-50"
        >
          <Avatar
            name={user.name}
            version={user.avatarVersion}
            className="h-9 w-9 rounded-full text-sm"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-stone-900">
              {user.name}
            </span>
            <span className="block text-xs text-stone-400">View profile</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}