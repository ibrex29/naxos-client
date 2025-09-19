import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '', 
        pathname: '/**', // Optional: '/photo/**' for stricter matching, but '/**' allows all paths
      },
    ],
  },
};

export default nextConfig;
