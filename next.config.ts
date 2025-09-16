import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable Node.js runtime for middleware to fix __dirname issues
    // This allows middleware to use Node.js APIs like __dirname
    instrumentationHook: true,
  },
};

export default nextConfig;