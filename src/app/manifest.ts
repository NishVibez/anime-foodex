import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anime FooDex — The fandom food encyclopedia",
    short_name: "Anime FooDex",
    description:
      "Discover, cook, collect, and share independently authored fandom-food recipes.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#F7F0E3",
    theme_color: "#D74A2A",
    categories: ["food", "lifestyle", "entertainment"],
    icons: [
      {
        src: "/foodex-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/foodex-icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
