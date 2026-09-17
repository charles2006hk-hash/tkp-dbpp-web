import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // 設定 metadataBase 讓 Next.js 自動解析相對路徑的絕對 URL
  metadataBase: new URL('https://tkp-dbpp.org.hk'),
  
  title: '鄧鏡波學校鮑思高同學會',
  description: '立己立人 We Love, We Care。傳承鮑思高精神，凝聚舊生力量。歡迎回到鄧鏡波學校鮑思高同學會的大家庭，與昔日同窗攜手共創未來。',
  
  // 替換左上角的黑底白字 Vercel/Next.js Logo
  icons: {
    icon: '/logo.png',   // 瀏覽器分頁圖示
    apple: '/logo.png',  // 蘋果設備加到主畫面時的圖示
  },
  
  // Open Graph：用於 WhatsApp, Facebook 等社群媒體分享時的預覽卡片
  openGraph: {
    title: '鄧鏡波學校鮑思高同學會',
    description: '傳承鮑思高精神，凝聚舊生力量。歡迎回到鄧鏡波學校鮑思高同學會的大家庭，與昔日同窗攜手共創未來。',
    url: 'https://tkp-dbpp.org.hk',
    siteName: '鄧鏡波學校鮑思高同學會',
    images: [
      {
        // 建議：未來可製作一張 1200x630 像素的橫式大圖放在 public 下替換，分享排版會更美觀
        url: '/logo.png', 
        width: 800,
        height: 800,
        alt: '鄧鏡波學校鮑思高同學會 Logo',
      },
    ],
    locale: 'zh_HK',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-HK" // 修正語言為繁體中文 (香港)
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
