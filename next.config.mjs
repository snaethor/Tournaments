/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Socket.io to work with Next.js custom server
  webpack: (config) => {
    config.externals.push({ bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate" });
    return config;
  },
};

export default nextConfig;
