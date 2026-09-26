import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  allowedDevOrigins: [
    'picknwear-mirfawad-1234.loca.lt', 
    'https://picknwear-mirfawad-1234.loca.lt'
  ],
};

export default nextConfig;
