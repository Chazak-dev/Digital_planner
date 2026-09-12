import {
  LayoutDashboard,
  GraduationCap,
  Target,
  CalendarDays,
  Inbox,
  TrendingUp,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar's primary row; the rest live under "More". */
  primary?: boolean;
};

// Default order — customizable from Settings (profiles.nav_order).
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, primary: true },
  { href: "/university", label: "University", icon: GraduationCap, primary: true },
  { href: "/goals", label: "Goals", icon: Target, primary: true },
  { href: "/planner", label: "Planner", icon: CalendarDays, primary: true },
  { href: "/inbox", label: "Task Inbox", icon: Inbox },
  { href: "/insights", label: "Progress & Insights", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

/**
 * Reorders NAV_ITEMS per a saved list of hrefs. Unknown/missing hrefs (a
 * stale preference, or a page added since it was saved) just fall back to
 * their default position at the end, so this never silently drops a page.
 */
export function orderNavItems(savedOrder: string[] | null | undefined): NavItem[] {
  if (!savedOrder || savedOrder.length === 0) return NAV_ITEMS;
  const byHref = new Map(NAV_ITEMS.map((item) => [item.href, item]));
  const ordered: NavItem[] = [];
  for (const href of savedOrder) {
    const item = byHref.get(href);
    if (item) {
      ordered.push(item);
      byHref.delete(href);
    }
  }
  return [...ordered, ...byHref.values()];
}
