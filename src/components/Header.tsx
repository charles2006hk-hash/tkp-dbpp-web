import Link from 'next/link';

export default function Header() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-inner">
                TKP
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900 tracking-tight">鄧鏡波學校</h1>
                <p className="text-sm font-semibold text-blue-600">鮑思高同學會</p>
              </div>
            </Link>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-blue-900 font-medium hover:text-blue-600 transition-colors">首頁</Link>
            <Link href="/about" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">關於我們</Link>
            <Link href="/#events" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">活動花絮</Link>
            <Link href="/news" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">最新動態</Link>
            <Link href="/#membership" className="px-4 py-2 bg-blue-900 text-white rounded-md text-sm font-bold hover:bg-blue-800 transition-colors">加入會員</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
