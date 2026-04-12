import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "icdvsrhauwfomggyswbt.supabase.co",
        pathname: "/storage/v1/object/public/wahi/**",
      },
    ],
  },
};

export default nextConfig;
