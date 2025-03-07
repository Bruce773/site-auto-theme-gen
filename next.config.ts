import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'picsum.photos',
      'pexels.com',
      'images.pexels.com',
      'api.pexels.com',
    ],
    disableStaticImages: true,
  },
  /* config options here */
};

export default nextConfig;
