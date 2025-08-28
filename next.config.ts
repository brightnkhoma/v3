import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images : {
    domains : ["firebasestorage.googleapis.com"]
  },
  eslint : {
    ignoreDuringBuilds : true
  }
  /* config options here */
};

export default nextConfig;
