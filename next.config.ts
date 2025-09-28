import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your normal Next.js config
  reactStrictMode: true,

  // Prevent Next.js from trying to bundle Prisma runtime files for the browser
  webpack(config) {
    config.module.rules.push({
      test: /src\/generated\/prisma\/.*\.js$/,
      use: 'null-loader', // ignore these files in the client bundle
    });

    return config;
  },
};

export default nextConfig;
