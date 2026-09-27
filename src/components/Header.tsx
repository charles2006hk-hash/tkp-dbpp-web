'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname(); // 獲取當前網址路徑

  const closeMenu = () => setIsMobileMenuOpen(false);

  // 判斷是否為當前頁面的輔助函數
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  // 定義選單資料，方便統一管理與渲染
  const navLinks = [
    {
      path: '/',
      label: '首頁',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    },
    {
      path: '/about',
      label: '關於我們',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    },
    {
      path: '/events',
      label: '活動花絮',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    },
    {
      path: '/news',
      label: '最新動態',
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo 區塊 */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
              <div className="relative w-10 h-12 sm:w-12 sm:h-14 flex-shrink-0">
                <Image src="/logo.png" alt="鄧鏡波學校 Logo" fill className="object-contain" sizes="48px" priority />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-blue-900 tracking-tight leading-tight">鄧鏡波學校</h1>
                <p className="text-xs sm:text-sm font-semibold text-blue-600">鮑思高同學會</p>
              </div>
            </Link>
          </div>

          {/* 桌面版導覽列 */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path} 
                className={`flex items-center gap-1.5 transition-colors ${
                  isActive(link.path) 
                    ? 'text-blue-900 font-extrabold stroke-[2px]' // 🌟 當前頁面高亮樣式
                    : 'text-slate-500 font-medium hover:text-blue-600'
                }`}
              >
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={isActive(link.path) ? 2 : 1.5} stroke="currentColor" className="w-5 h-5">
                  {link.icon}
                </svg>
                {link.label}
              </Link>
            ))}
            
            <Link href="/membership" className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white rounded-md text-sm font-bold hover:bg-blue-800 transition-colors shadow-sm hover:shadow-md">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              加入會員
            </Link>
          </div>

          {/* 手機版漢堡選單按鈕 */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-blue-900 focus:outline-none p-2">
              {isMobileMenuOpen ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 手機版下拉選單 */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg absolute w-full animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path} 
                onClick={closeMenu} 
                className={`flex items-center gap-3 px-3 py-4 text-base rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-900 font-extrabold'
                    : 'text-slate-600 font-medium hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={isActive(link.path) ? 2 : 1.5} stroke="currentColor" className={`w-5 h-5 ${isActive(link.path) ? 'text-blue-900' : 'text-blue-600'}`}>
                  {link.icon}
                </svg>
                {link.label}
              </Link>
            ))}
            
            <div className="pt-4 pb-2 px-3">
              <Link href="/membership" onClick={closeMenu} className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 bg-blue-900 text-white rounded-lg text-base font-bold hover:bg-blue-800 shadow-md">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
                加入會員
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
