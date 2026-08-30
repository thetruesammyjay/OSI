import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Keep development artifacts separate from production builds. This prevents
  // interrupted Windows dev/build processes from racing over .next manifests.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
