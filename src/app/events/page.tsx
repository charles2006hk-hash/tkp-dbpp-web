import Link from 'next/link';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '活動花絮 - 鄧鏡波學校鮑思高同學會',
  description: '重溫昔日情誼，支持母校發展。掌握鄧鏡波學校鮑思高同學會最新活動與聚會資訊。',
};

export const revalidate = 60; // 啟用 ISR，每 60 秒快取更新

// 從 Firestore 'events' 集合撈取活動資料
async function fetchEvents() {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export default async function EventsPage() {
  const eventList = await fetchEvents();

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
            {eventList.length === 0 ? (
              <div className="col-span-full text-center text-slate-500 py-12">
                目前尚無活動資料，請由後台 CMS 新增。
              </div>
            ) : (
              eventList.map((event) => (
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

                  {/* 優先顯示活動舉辦時間 (eventDateTime)，若無則顯示發佈日期 (date) */}
                  <div className="text-blue-600 font-bold tracking-wider mb-3 text-sm mt-2">
                    {event.eventDateTime || event.date}
                  </div>
                  
                  <h4 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h4>
                  
                  {/* 內文限制 3 行，保持排版整齊 */}
                  <p className="text-slate-600 text-sm leading-relaxed flex-grow line-clamp-3 whitespace-pre-wrap">
                    {event.content}
                  </p>

                  {/* 底部行動呼籲按鈕 */}
                  <div className="mt-8 pt-4 border-t border-slate-100">
                    {event.status === 'upcoming' ? (
                      event.registrationUrl ? (
                        // 有外部報名連結，另開視窗
                        <a 
                          href={event.registrationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block text-center w-full py-2 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          了解詳情 / 報名
                        </a>
                      ) : (
                        // 無連結時的禁用狀態
                        <button disabled className="w-full py-2 bg-slate-100 text-slate-400 font-bold rounded-lg cursor-not-allowed">
                          報名即將開放
                        </button>
                      )
                    ) : (
                      // 歷史活動連至內頁詳情 (若未來建立 /events/[id]/page.tsx)
                      <Link 
                        href={`/events/${event.id}`} 
                        className="block text-center w-full py-2 bg-slate-50 text-slate-500 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        查看活動詳情
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
