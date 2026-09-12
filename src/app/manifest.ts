import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Planner",
    short_name: "Planner",
    description: "A personal planner for university and life, on your terms.",
    start_url: "/",
    display: "standalone",
    background_color: "#fcf3f6",
    theme_color: "#c96a87",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
