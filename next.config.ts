import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
  basePath: '/websets-news-monitor',
  // @ts-ignore - `serverActions` is under experimental features and may not be typed yet
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  }
};

export default nextConfig;
