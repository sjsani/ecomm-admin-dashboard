import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uggqixqyfjjeypuiitox.supabase.co',
        port: '',
      },
    ],
  },
};

export default nextConfig;
