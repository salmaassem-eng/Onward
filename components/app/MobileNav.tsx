"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import type { SessionUser } from "@/lib/session";
import Avatar from "./Avatar";
import LogoutButton from "./LogoutButton";
import { navItems, settingsItem, type NavItem } from "./nav-items";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function DrawerLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition ${
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

export default function MobileNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const panel = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  // close the menu when the page changes
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const close = () => setOpen(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (!open) return;

    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    function onKey(e: KeyboardEvent) {
      // the logout confirmation is another dialog: let it handle its own keys
      const otherDialogOpen = document.querySelectorAll('[aria-modal="true"]').length > 1;

      if (e.key === "Escape" && !otherDialogOpen) {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panel.current?.contains(document.activeElement)) return;

      const items = panel.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === panel.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      menuButton.current?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white pt-[env(safe-area-inset-top)] lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Logo variant="onLight" size="md" />
          <button
            ref={menuButton}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-stone-700 transition hover:bg-stone-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div
        inert={!open}
        className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`}
      >
        <div
          aria-hidden
          onClick={close}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          ref={panel}
          id="mobile-menu"
          role="dialog"
          aria-modal={open ? "true" : undefined}
          aria-label="Menu"
          tabIndex={-1}
          className={`absolute inset-y-0 right-0 flex w-[85%] max-w-xs flex-col bg-white pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-2xl outline-none transition-transform duration-300 motion-reduce:transition-none ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-14 shrink-0 items-center justify-between px-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Menu
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-stone-500 transition hover:bg-stone-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-3 pb-2">
            <Link
              href="/settings"
              onClick={close}
              className="flex items-center gap-3 rounded-2xl bg-stone-50 px-4 py-3 transition hover:bg-stone-100"
            >
              <Avatar
                name={user.name}
                version={user.avatarVersion}
                className="h-11 w-11 rounded-full text-base"
              />
              <span className="min-w-0">
                <span className="block truncate font-semibold text-stone-900">{user.name}</span>
                <span className="block text-xs text-stone-400">View profile</span>
              </span>
            </Link>
          </div>

          <nav aria-label="Main" className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <DrawerLink item={item} active={isActive(item.href)} onNavigate={close} />
                </li>
              ))}
              <li>
                <DrawerLink
                  item={settingsItem}
                  active={isActive(settingsItem.href)}
                  onNavigate={close}
                />
              </li>
            </ul>
          </nav>

          <div className="shrink-0 border-t border-stone-200 px-3 py-3">
            <LogoutButton className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium text-stone-600 transition hover:bg-red-50 hover:text-red-600">
              <LogOut className="h-5 w-5" />
              Log out
            </LogoutButton>
          </div>
        </aside>
      </div>
    </>
  );
}