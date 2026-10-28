"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import type { SessionUser } from "@/lib/session";
import Avatar from "./Avatar";
import LogoutButton from "./LogoutButton";
import { navItems } from "./nav-items";

export default function MobileNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white pt-[env(safe-area-inset-top)] lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Logo variant="onLight" size="md" />

          <div className="flex items-center gap-1">
            <Link
              href="/settings"
              aria-label="Profile and settings"
              aria-current={pathname.startsWith("/settings") ? "page" : undefined}
              className={`rounded-full p-0.5 transition ${
                pathname.startsWith("/settings") ? "ring-2 ring-green-500" : ""
              }`}
            >
              <Avatar
                name={user.name}
                version={user.avatarVersion}
                className="h-9 w-9 rounded-full text-sm"
              />
            </Link>
            <LogoutButton className="rounded-full p-2.5 text-stone-500 transition hover:bg-red-50 hover:text-red-600">
              <LogOut className="h-5 w-5" />
            </LogoutButton>
          </div>
        </div>
      </header>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                    active ? "text-green-700" : "text-stone-400 hover:text-stone-700"
                  }`}
                >
                  <span
                    className={`flex h-7 w-12 items-center justify-center rounded-full transition ${
                      active ? "bg-green-50" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {item.short}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}