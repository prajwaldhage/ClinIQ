import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["http://100.100.1.5:3001", "100.100.1.5", "http://localhost:3000", "http://localhost:3001", "localhost:3001"],
};

export default nextConfig;
