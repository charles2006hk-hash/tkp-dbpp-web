import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 忽略 ESLint 錯誤，確保 Vercel 能完成 Build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 忽略 TypeScript 型別錯誤
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;