/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@beacon-point/ui"],
  // experimental: {
  //   appDir: true,
  // },
};

module.exports = nextConfig;
