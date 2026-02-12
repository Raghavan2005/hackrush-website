import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export',
  images: {
    unoptimized: true, // Firebase static hosting can't resize images on the fly
  },
};

export default nextConfig;
