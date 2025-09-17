import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper routing and performance  
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  
  // Optimize for Vercel deployment
  experimental: {
    optimizePackageImports: ['@supabase/ssr'],
  },
};

export default nextConfig;