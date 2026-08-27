import Image from 'next/image';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 60;

// Next.js 15: params 是一個 Promise
export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const docRef = doc(db, 'events', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    notFound(); // 找不到資料跳轉 404
  }

  const event = { id: docSnap.id, ...docSnap.data() } as any;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow py-16 px-4 md:px-8 max-w-4xl mx-auto w-full">
        
        {/* 標題與 Metadata */}
        <header className="mb-10 text-center">
          <div className="mb-4 flex justify-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              event.status === 'upcoming' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-slate-200 text-slate-600'
            }`}>
              {event.status === 'upcoming' ? '即將舉辦' : '圓滿結束'}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            {event.title}
          </h1>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 text-slate-600 font-medium bg-white p-4 rounded-xl border border-slate-200 shadow-sm inline-flex mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">📅 時間：</span>
              <span className="text-blue-700 font-bold">{event.eventDateTime || event.date}</span>
            </div>
            {event.contactInfo && (
              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-6">
                <span className="text-slate-400">👤 聯絡：</span>
                <span>{event.contactInfo}</span>
              </div>
            )}
          </div>
        </header>

        {/* 封面圖片 */}
        <div className="relative w-full aspect-[21/9] bg-slate-200 rounded-2xl overflow-hidden mb-12 shadow-lg">
          {event.imageUrl ? (
            <Image src={event.imageUrl} alt={event.title} fill className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
              <span className="text-4xl font-black text-slate-300 tracking-widest select-none">TKP-DBPP</span>
            </div>
          )}
        </div>

        {/* 文章內容 */}
        <article className="prose prose-lg prose-blue mx-auto text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          {event.content}
        </article>

        {/* 報名按鈕區塊 (僅在有報名網址且尚未結束時顯示) */}
        {event.status === 'upcoming' && event.registrationUrl && (
          <div className="mt-16 text-center border-t border-slate-200 pt-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">歡迎校友踴躍參與</h3>
            <a 
              href={event.registrationUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block bg-blue-600 text-white font-bold text-lg rounded-full px-12 py-4 shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              前往報名表單 &rarr;
            </a>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
