import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  // Turbopack config (Next.js 16+ uses Turbopack by default)
  turbopack: {
    root: process.cwd(),
  },
  /* config options here */
};

export default nextConfig;
