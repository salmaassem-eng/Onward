"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { logout } from "@/app/actions/auth";
import { navItems, settingsItem } from "./nav-items";

export default function MobileNav() {
  const pathname = usePathname();
  const items = [...navItems, settingsItem];

  return (
    <header className="border-b border-stone-200 bg-white lg:hidden">
      <div className="flex h-16 items-center justify-between px-6">
        <Logo variant="onLight" size="md" href="/dashboard" />
        <form action={logout}>
          <button
            type="submit"
            className="text-sm font-medium text-stone-500 hover:text-red-600"
          >
            Log out
          </button>
        </form>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-6 pb-3">
        {items.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
                active
                  ? "bg-green-50 text-green-700"
                  : "text-stone-500 hover:bg-stone-50"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}