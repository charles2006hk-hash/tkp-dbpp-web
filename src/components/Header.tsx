'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 點擊連結後自動關閉手機選單
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo 區塊 */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
              <div className="relative w-10 h-12 sm:w-12 sm:h-14 flex-shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="鄧鏡波學校 Logo" 
                  fill
                  className="object-contain"
                  sizes="48px"
                  priority 
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-blue-900 tracking-tight leading-tight">鄧鏡波學校</h1>
                <p className="text-xs sm:text-sm font-semibold text-blue-600">鮑思高同學會</p>
              </div>
            </Link>
          </div>

          {/* 桌面版導覽列 */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-blue-900 font-medium hover:text-blue-600 transition-colors">首頁</Link>
            <Link href="/about" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">關於我們</Link>
            <Link href="/events" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">活動花絮</Link>
            <Link href="/news" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">最新動態</Link>
            <Link href="/membership" className="px-4 py-2 bg-blue-900 text-white rounded-md text-sm font-bold hover:bg-blue-800 transition-colors shadow-sm hover:shadow-md">加入會員</Link>
          </div>

          {/* 手機版漢堡選單按鈕 */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-blue-900 focus:outline-none p-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 手機版下拉選單 */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg absolute w-full animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
            <Link href="/" onClick={closeMenu} className="block px-3 py-4 text-base font-medium text-slate-800 hover:text-blue-600 hover:bg-blue-50 rounded-lg">首頁</Link>
            <Link href="/about" onClick={closeMenu} className="block px-3 py-4 text-base font-medium text-slate-800 hover:text-blue-600 hover:bg-blue-50 rounded-lg">關於我們</Link>
            <Link href="/events" onClick={closeMenu} className="block px-3 py-4 text-base font-medium text-slate-800 hover:text-blue-600 hover:bg-blue-50 rounded-lg">活動花絮</Link>
            <Link href="/news" onClick={closeMenu} className="block px-3 py-4 text-base font-medium text-slate-800 hover:text-blue-600 hover:bg-blue-50 rounded-lg">最新動態</Link>
            <div className="pt-4 pb-2 px-3">
              <Link href="/membership" onClick={closeMenu} className="block w-full text-center px-4 py-3 bg-blue-900 text-white rounded-lg text-base font-bold hover:bg-blue-800 shadow-md">
                加入會員
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
