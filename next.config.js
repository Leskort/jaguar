/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production
  compress: true,
  
  // Experimental features for better chunk handling
  experimental: {
    optimizePackageImports: ['framer-motion', 'lottie-react'],
  },
};

module.exports = nextConfig;


