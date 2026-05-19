import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We use plain <img> tags for game media so Next.js image optimization
  // doesn't block R2-hosted assets without a remotePatterns allowlist.
  images: { unoptimized: true },

  // Silence the Next.js "powered-by" header in production.
  poweredByHeader: false,

  // Strict mode surfaces double-invocation bugs in development.
  reactStrictMode: true,
};

export default nextConfig;
