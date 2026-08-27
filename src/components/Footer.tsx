import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 relative overflow-hidden mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p>&copy; {new Date().getFullYear()} 鄧鏡波學校鮑思高同學會. All rights reserved.</p>
        </div>
        <div className="flex space-x-6 relative">
          <a href="#" className="hover:text-white transition-colors">Facebook</a>
          <a href="#" className="hover:text-white transition-colors">聯絡我們</a>
          
          {/* 隱藏的 CMS 入口：滑鼠懸停於右下角才會顯示 */}
          <Link 
            href="/cms" 
            className="absolute -right-10 top-0 w-6 h-6 rounded-full bg-transparent hover:bg-slate-800 transition-colors flex items-center justify-center opacity-10 hover:opacity-100 cursor-pointer"
            title="Staff Only"
          >
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
