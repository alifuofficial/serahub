import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  output: "standalone",
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;