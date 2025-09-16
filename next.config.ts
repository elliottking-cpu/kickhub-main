import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // instrumentationHook is available by default in Next.js 15.5.3
  // Only need runtime: 'nodejs' in middleware.ts config
};

export default nextConfig;