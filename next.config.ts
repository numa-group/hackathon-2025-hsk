import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "1000mb",
    },
  } /* config options here */,
};

export default nextConfig;
