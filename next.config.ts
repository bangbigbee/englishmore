import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    esmExternals: true,
    workerThreads: false,
    cpus: 1
  }
};

export default nextConfig;
