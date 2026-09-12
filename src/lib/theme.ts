export type Theme = "system" | "light" | "dark";

/** Applies a theme to the current document immediately (optimistic UI). */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}
