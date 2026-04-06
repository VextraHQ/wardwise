import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WardWise Collect",
    short_name: "WardWise",
    description: "Supporter registration for political campaigns",
    start_url: "/c",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d9488",
    icons: [
      {
        src: "/icon.png",
        sizes: "360x360",
        type: "image/png",
      },
    ],
  };
}
