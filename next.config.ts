import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper static file serving and routing
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  
  // Enable static exports for better Vercel compatibility
  output: 'standalone',
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Enable compression
  compress: true,
};

export default nextConfig;