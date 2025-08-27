import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/ddhrsxkkf/**', // Replace with your Cloudinary cloud name
      },
    ],
  },
};

export default nextConfig;
