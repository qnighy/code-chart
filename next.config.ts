import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/u/\\[codepoint\\]": ["./public/data/**/*"],
  },
};

export default nextConfig;
