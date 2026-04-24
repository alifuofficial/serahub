import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SeraHub - Job & Bid Aggregator",
    short_name: "SeraHub",
    description: "Discover the latest jobs, bids, and tender opportunities.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#00c087",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}