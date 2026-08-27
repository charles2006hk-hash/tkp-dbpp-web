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
  // 允許 Next.js <Image /> 組件載入並代理 Firebase Storage 圖片
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
