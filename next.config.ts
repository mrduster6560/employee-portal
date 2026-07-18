import dns from 'node:dns'
dns.setDefaultResultOrder('ipv4first')
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
