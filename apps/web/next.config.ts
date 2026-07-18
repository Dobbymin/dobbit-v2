import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.upbit.com",
        pathname: "/logos/**",
      },
    ],
    minimumCacheTTL: 2_592_000,
  },
};

export default nextConfig;
