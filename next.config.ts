import type { NextConfig } from 'next';

const baseDomain = process.env.NEXT_PUBLIC_IMAGE_DOMAIN || 'v3-admin.foodhutz.co';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: baseDomain,
      },
      {
        protocol: 'https',
        hostname: '*.foodhutz.co',
  },
      {
        protocol: 'https',
        hostname: '*.foodhutz.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
    // Allow unoptimized images in development
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Improve error handling during builds
  typescript: {
    ignoreBuildErrors: false
  }
};
export default nextConfig;
