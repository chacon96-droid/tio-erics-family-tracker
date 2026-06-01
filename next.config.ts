import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  htmlLimitedBots: /.*/,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb"
    }
  }
};

export default nextConfig;
