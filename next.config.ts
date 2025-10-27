import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Skip ESLint in Vercel builds
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Skip TypeScript errors during builds
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uggqixqyfjjeypuiitox.supabase.co",
      },
    ],
  },
};

export default nextConfig;
