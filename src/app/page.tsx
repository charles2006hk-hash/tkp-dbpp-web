import React from 'react';

// 強制取消靜態快取，確保每次請求都進 Server 重新運算
export const dynamic = 'force-dynamic';

export default async function Home(props: {
  // 兼容 Next.js 15 (Promise) 與 14 (Object) 的型別定義
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  // 1. 解析參數 (使用 await 兼容 Next.js 15+ 規範)
  const searchParams = await props.searchParams;
  const isPreviewBypass = searchParams?.preview === 'tkp2026';

  // 2. 檢查維護模式變數
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  // ==========================================
  // 維護模式 / 升級中畫面
  // ==========================================
  if (isMaintenanceMode && !isPreviewBypass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-200 to-slate-300 p-4 md:p-8 font-sans text-slate-800">
        <div className="max-w-3xl w-full bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 md:p-16 text-center border border-white relative overflow-hidden">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-100/50 blur-3xl rounded-full pointer-events-none"></div>

          <div className="flex justify-center mb-8 relative z-10">
            <svg className="w-14 h-14 text-[#1e3a8a] animate-[spin_4s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>

          <div className="mb-10 relative z-10">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-5 tracking-widest">
              全新網站架構升級中
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-loose max-w-xl mx-auto break-keep">
              為了提供更流暢的服務與數位體驗，我們正在進行系統底層重構與資料庫遷移作業。<br className="hidden md:block" />
              網站將於近期以全新面貌重新上線，敬請期待。
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 my-10 opacity-30">
            <div className="h-px w-20 bg-slate-500"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
            <div className="h-px w-20 bg-slate-500"></div>
          </div>

          <div className="mb-12 relative z-10">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 uppercase tracking-[0.2em]">
              System Upgrade in Progress
            </h2>
            <p className="text-slate-500 text-sm leading-loose max-w-xl mx-auto">
              We are currently upgrading our system infrastructure and migrating databases to bring you a better digital experience. <br className="hidden md:block" />
              The website will be back online soon with a brand new look.
            </p>
          </div>

          <div className="pt-8 border-t border-slate-200/60 relative z-10">
            <p className="text-xs font-bold text-slate-700 tracking-[0.15em] mb-1">
              鄧鏡波學校鮑思高同學會 (TKP-DBPP)
            </p>
            <p className="text-[9px] text-slate-400 tracking-[0.2em] uppercase font-medium mt-2">
              Powered by YIMI International
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 正式頁面代碼 (開發中/預覽版)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-[#1e3a8a] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg md:text-2xl font-bold tracking-wider">
            鄧鏡波學校鮑思高同學會
          </h1>
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <a href="#" className="hover:text-blue-300 transition">首頁</a>
            <a href="#" className="hover:text-blue-300 transition">學校消息</a>
            <a href="#" className="hover:text-blue-300 transition">校董選舉</a>
            <a href="#" className="hover:text-blue-300 transition">聖約瑟基金</a>
            <a href="#" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition shadow">
              幹事後台登入
            </a>
          </nav>
        </div>
      </header>

      <section className="bg-blue-50 py-20 px-4 text-center border-b border-blue-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-blue-900 mb-6 leading-tight">
            團結校友，延續<br className="md:hidden" />「立己立人」精神
          </h2>
          <p className="text-lg text-gray-600 mb-8 md:px-16">
            歡迎來到全新的鄧鏡波學校鮑思高同學會網站。在這裡，您可以掌握母校最新動態、參與校友會活動，並透過聖約瑟基金回饋母校。
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button className="bg-[#1e3a8a] text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-800 shadow-lg transition">
              最新活動報名
            </button>
            <button className="bg-white text-[#1e3a8a] border-2 border-[#1e3a8a] px-8 py-3 rounded-lg font-bold hover:bg-blue-50 shadow transition">
              了解聖約瑟基金
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b pb-4">
          <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-[#1e3a8a] pl-4">
            最新消息
          </h3>
          <a href="#" className="text-sm text-blue-600 hover:underline">查看全部 &rarr;</a>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
            <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400 font-medium">
              [活動縮圖佔位]
            </div>
            <div className="p-6">
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">校董選舉</span>
              <h4 className="font-bold text-lg mt-3 mb-2 line-clamp-2">2026-2028年度校友校董選舉</h4>
              <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                校友校董選舉提名期即將展開，誠邀各位合資格校友參與，為母校發展出分力。有意參選者須獲5名合資格的校友提名...
              </p>
              <p className="text-xs text-gray-400">發表於 2026-05-01</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
            <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400 font-medium">
              [活動縮圖佔位]
            </div>
            <div className="p-6">
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">活動消息</span>
              <h4 className="font-bold text-lg mt-3 mb-2 line-clamp-2">舊生回校日暨感恩祭</h4>
              <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                一年一度的舊生回校日將於下月舉行，歡迎各位師兄弟攜同家眷回校共聚，重溫昔日校園點滴...
              </p>
              <p className="text-xs text-gray-400">發表於 2026-04-15</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
            <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400 font-medium">
              [活動縮圖佔位]
            </div>
            <div className="p-6">
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded">母校鐸聲</span>
              <h4 className="font-bold text-lg mt-3 mb-2 line-clamp-2">校長指導講話：迎接新學年</h4>
              <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                校長於開學禮上與同學及校友分享本年度學校發展方向及願景，強調全人教育的重要性...
              </p>
              <p className="text-xs text-gray-400">發表於 2026-03-20</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-10 text-center text-sm mt-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; 2026 鄧鏡波學校鮑思高同學會 TKP-DBPP. All rights reserved.</p>
          <div className="space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">聯絡我們</a>
            <a href="#" className="hover:text-white transition">本會Facebook</a>
            <a href="#" className="hover:text-white transition">聖約瑟基金授權書下載</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
