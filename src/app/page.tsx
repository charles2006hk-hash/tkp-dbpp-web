import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 導覽列 Header */}
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

      {/* 視覺主視覺 Hero Section */}
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

      {/* 最新消息 Latest News */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b pb-4">
          <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-[#1e3a8a] pl-4">
            最新消息
          </h3>
          <a href="#" className="text-sm text-blue-600 hover:underline">查看全部 &rarr;</a>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* 新聞卡片 1 */}
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

          {/* 新聞卡片 2 */}
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

          {/* 新聞卡片 3 */}
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

      {/* 頁尾 Footer */}
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