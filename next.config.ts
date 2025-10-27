import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ This disables ESLint checking in Vercel builds
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uggqixqyfjjeypuiitox.supabase.co',
      },
    ],
  },
};

export default nextConfig;
