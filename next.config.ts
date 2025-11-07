import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production
  compress: true,
  
  // Experimental features for better chunk handling
  experimental: {
    optimizePackageImports: ['framer-motion', 'lottie-react'],
  },
};

export default nextConfig;
