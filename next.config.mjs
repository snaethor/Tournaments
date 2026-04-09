/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent Next.js from bundling these packages — use them directly from node_modules
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Required for Socket.io to work with Next.js custom server
  webpack: (config) => {
    config.externals.push({ bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate" });
    return config;
  },
};

export default nextConfig;
