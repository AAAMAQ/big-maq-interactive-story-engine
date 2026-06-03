import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Big MAQ Interactive Story Engine",
    short_name: "Big MAQ Stories",
    description: "A privacy-first visual branching story editor.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7ff",
    theme_color: "#4f46e5",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

