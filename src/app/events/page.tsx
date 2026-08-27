import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '活動花絮 - 鄧鏡波學校鮑思高同學會',
  description: '重溫昔日情誼，支持母校發展。掌握鄧鏡波學校鮑思高同學會最新活動與聚會資訊。',
};

// 若未來建立 Firestore 'events' 集合，可在此處加入 fetchEvents()
const mockEvents = [
  {
    id: "evt-01",
    title: "2026 校友會週年大會 (AGM)",
    date: "2026年11月15日",
    desc: "誠邀各位會員出席，共商會務發展及票選新一屆幹事。會後將備有茶點招待。",
    status: "upcoming", // upcoming | past
  },
  {
    id: "evt-02",
    title: "鄧鏡波盃 舊生籃球邀請賽",
    date: "2026年12月10日",
    desc: "穿上波衫，重返修院球場！歡迎各屆校友組隊參加，與師兄弟切磋球技，重溫熱血青春。",
    status: "upcoming",
  },
  {
    id: "evt-03",
    title: "鮑思高瞻禮感恩祭暨舊生晚宴",
    date: "2027年1月31日",
    desc: "紀念會祖聖若望·鮑思高，齊聚一堂感念恩師教導。晚宴將設有大抽獎及校友表演環節。",
    status: "upcoming",
  },
  {
    id: "evt-04",
    title: "2025 校友會新春盆菜宴",
    date: "2025年2月",
    desc: "超過三百名校友及老師聚首母校操場，共享傳統盆菜，氣氛熱鬧，圓滿結束。",
    status: "past",
  }
];

export default function EventsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 頁面標題 */}
          <header className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-6 tracking-tight">活動花絮</h1>
            <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              立己立人，服務社群。<br className="hidden sm:block" />
              透過多元化的校友活動，重溫昔日校園情誼，並將鮑思高精神傳承不息。
            </p>
          </header>
          
          {/* 活動列表網格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockEvents.map((event) => (
              <div 
                key={event.id} 
                className="group flex flex-col bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                {/* 狀態標籤 (Upcoming / Past) */}
                <div className="absolute top-0 right-0">
                  <span className={`inline-block px-4 py-1 text-xs font-bold rounded-bl-lg ${
                    event.status === 'upcoming' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {event.status === 'upcoming' ? '即將舉辦' : '圓滿結束'}
                  </span>
                </div>

                <div className="text-blue-600 font-bold tracking-wider mb-3 text-sm mt-2">
                  {event.date}
                </div>
                
                <h4 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </h4>
                
                <p className="text-slate-600 text-sm leading-relaxed flex-grow">
                  {event.desc}
                </p>

                {/* 底部行動呼籲按鈕 */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                  {event.status === 'upcoming' ? (
                    <button className="w-full py-2 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                      了解詳情 / 報名
                    </button>
                  ) : (
                    <button className="w-full py-2 bg-slate-50 text-slate-500 font-bold rounded-lg hover:bg-slate-200 transition-colors">
                      查看活動相簿
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
