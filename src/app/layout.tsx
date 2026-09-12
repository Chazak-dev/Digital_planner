import type { Metadata, Viewport } from "next";
import { Petrona, Nunito_Sans } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const petrona = Petrona({
  variable: "--font-petrona",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Planner",
  description: "A personal planner for university and life, on your terms.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Planner",
  },
};

export async function generateViewport(): Promise<Viewport> {
  const cookieStore = await cookies();
  const isDark = cookieStore.get("planner-theme")?.value === "dark";
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: isDark ? "#241820" : "#fcf3f6",
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("planner-theme")?.value;
  const dataTheme = themeCookie === "light" || themeCookie === "dark" ? themeCookie : undefined;

  return (
    <html
      lang="en"
      data-theme={dataTheme}
      className={`${petrona.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
