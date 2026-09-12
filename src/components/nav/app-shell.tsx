"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal, LogOut, X, Search } from "lucide-react";
import { orderNavItems } from "@/lib/nav-items";
import { signOut } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Theme } from "@/lib/theme";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({
  email,
  initialTheme,
  navOrder,
  children,
}: {
  email: string | undefined;
  initialTheme: Theme;
  navOrder: string[] | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const items = orderNavItems(navOrder);
  const primaryItems = items.filter((item) => item.primary);
  const secondaryItems = items.filter((item) => !item.primary);
  const currentLabel = items.find((item) => isActive(pathname, item.href))?.label ?? "Planner";

  return (
    <div className="flex min-h-full flex-1">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-raised px-4 py-6 md:flex">
        <div className="px-2 font-display text-lg font-semibold text-ink">Planner</div>

        <form action="/search" className="mt-5">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              name="q"
              placeholder="Search…"
              className="w-full rounded-lg border border-border bg-paper py-1.5 pl-8 pr-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
        </form>

        <nav className="mt-5 flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-ink-soft hover:bg-accent-soft/60 hover:text-ink"
                }`}
              >
                <item.icon size={18} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-border pt-4">
          <ThemeToggle initialTheme={initialTheme} />

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
              {email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1 truncate text-xs text-ink-soft">{email}</div>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Sign out"
                className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-raised px-4 md:hidden">
        <span className="font-display text-base font-semibold text-ink">{currentLabel}</span>
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className="rounded-md p-1.5 text-ink-soft hover:bg-accent-soft hover:text-accent"
          >
            <Search size={19} />
          </Link>
          <button
            type="button"
            aria-label="More"
            onClick={() => setMoreOpen(true)}
            className="rounded-md p-1.5 text-ink-soft hover:bg-accent-soft hover:text-accent"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col pt-14 pb-16 md:pt-0 md:pb-0">{children}</div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-stretch border-t border-border bg-raised md:hidden">
        {primaryItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                active ? "text-accent" : "text-ink-soft"
              }`}
            >
              <item.icon size={20} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-ink-soft"
        >
          <MoreHorizontal size={20} />
          More
        </button>
      </nav>

      {/* Mobile "More" sheet */}
      <div
        className={`fixed inset-0 z-30 md:hidden ${moreOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!moreOpen}
      >
        <button
          aria-label="Close menu"
          className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${
            moreOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMoreOpen(false)}
          tabIndex={moreOpen ? 0 : -1}
        />
        <div
          className={`absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-raised px-4 pb-8 pt-4 shadow-sm transition-transform duration-200 ease-out ${
            moreOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-base font-semibold text-ink">More</span>
              <button
                aria-label="Close"
                onClick={() => setMoreOpen(false)}
                className="rounded-md p-1.5 text-ink-soft hover:bg-accent-soft hover:text-accent"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-3">
              <ThemeToggle initialTheme={initialTheme} />
            </div>
            <div className="flex flex-col gap-1">
              {secondaryItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      active ? "bg-accent-soft text-accent" : "text-ink"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink-soft"
                >
                  <LogOut size={18} />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}
