import Link from 'next/link';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import CardImage from '@/components/CardImage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

const firebaseConfig = {
  apiKey: "AIzaSyCVpNegHunQSUNWAg5slp5TReqstk6eX5Y",
  authDomain: "tkp-dbpp.firebaseapp.com",
  projectId: "tkp-dbpp",
  storageBucket: "tkp-dbpp.firebasestorage.app",
  messagingSenderId: "994817627378",
  appId: "1:994817627378:web:11c021cec20e884bce2c6b"
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
export const revalidate = 60;

async function fetchLatestNews() {
  const newsRef = collection(db, 'news');
  const q = query(newsRef, orderBy('createdAt', 'desc'), limit(3));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
}

function MaintenanceView() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 px-4 text-center">
      <div className="relative w-24 h-28 mb-6">
        <Image 
          src="/logo.png" 
          alt="鄧鏡波學校 Logo" 
          fill
          className="object-contain"
          priority
        />
      </div>
      <h1 className="text-3xl font-extrabold text-blue-900 mb-4 tracking-tight">鄧鏡波學校鮑思高同學會</h1>
      <p className="text-lg text-slate-500 max-w-md mx-auto mb-8">全新校友會網站正在進行升級與測試。<br />敬請期待，我們即將以全新面貌與各位校友見面。</p>
      <div className="h-1 w-24 bg-blue-600 rounded-full mx-auto animate-pulse"></div>
    </div>
  );
}

function MainHomePage({ latestNews }: { latestNews: any[] }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <Header />
      
      {/* 主視覺區 */}
      <section className="relative bg-blue-900 py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-blue-900 to-blue-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
            立己立人 <br className="hidden md:block" /><span className="text-blue-300">We Love, We Care</span>
          </h2>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
            傳承鮑思高精神，凝聚舊生力量。歡迎回到鄧鏡波學校鮑思高同學會的大家庭，與昔日同窗攜手共創未來。
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/news" className="px-8 py-3 bg-white text-blue-900 font-bold rounded-full hover:bg-blue-50 transition-all shadow-lg hover:-translate-y-0.5">
              瀏覽最新動態
            </Link>
          </div>
        </div>
      </section>

      {/* 恢復：關於母校與鮑思高精神 */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h3 className="text-3xl font-extrabold text-blue-900 mb-6 relative inline-block">
                母校與鮑思高精神
                <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                「教育是一件內心的事情。」 作為慈幼會創辦人聖若望·鮑思高（St. John Bosco）畢生致力於青少年的教育與關懷。他提倡的「預防教育法」——以理智、宗教、仁愛為核心，深深影響了鄧鏡波學校的辦學理念。
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                本會冠以「鮑思高」之名，旨在提醒所有畢業校友，無論身處社會何方，皆應秉持母校教誨，關愛弱勢，熱心服務。
              </p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-2xl font-bold text-slate-800 mb-4">本屆幹事會 (Committee)</h4>
              <ul className="space-y-3 text-slate-700">
                <li className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-semibold">會長</span><span>李小明</span>
                </li>
                <li className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-semibold">副會長</span><span>張大志</span>
                </li>
                <li className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-semibold">秘書長</span><span>陳建國</span>
                </li>
                <li className="flex justify-between pt-2">
                  <span className="font-semibold">司庫</span><span>黃家輝</span>
                </li>
              </ul>
              <div className="mt-6 text-right">
                <Link href="/about" className="text-blue-600 font-semibold hover:text-blue-800 text-sm">查看完整架構 &rarr;</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 恢復：年度活動模組 */}
      <section id="events" className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-extrabold mb-4">近期活動與聚會</h3>
            <p className="text-slate-400">重溫昔日情誼，支持母校發展</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "2026 校友會週年大會 (AGM)", date: "2026年11月", desc: "誠邀各位會員出席，共商會務發展及票選新一屆幹事。" },
              { title: "鄧鏡波盃 舊生籃球邀請賽", date: "2026年12月", desc: "穿上波衫，重返修院球場，與師兄弟切磋球技。" },
              { title: "鮑思高瞻禮感恩祭暨舊生晚宴", date: "2027年1月", desc: "紀念會祖聖若望·鮑思高，齊聚一堂感念恩師教導。" },
            ].map((event, idx) => (
              <div key={idx} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500 transition-colors">
                <div className="text-blue-400 font-bold tracking-wider mb-2">{event.date}</div>
                <h4 className="text-xl font-bold mb-3">{event.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{event.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最新動態預覽：正確連至站內新聞頁 */}
      <section className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <h3 className="text-3xl font-extrabold text-blue-900">校友會動態</h3>
            <Link href="/news" className="hidden sm:inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
              查看全部新聞 &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestNews.map((post) => (
              <Link key={post.id} href={`/news/${post.id}`} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardImage imageUrl={post.imageUrl} title={post.title} isVideo={post.isVideo} />
                <div className="p-6 flex flex-col flex-grow">
                  <time className="text-xs font-bold text-blue-600 mb-2 block tracking-wider">{post.date}</time>
                  <h4 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600">{post.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 招募與加入模組 */}
      <section id="membership" className="py-20 bg-blue-600 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-extrabold text-white mb-6">歡迎加入鄧鏡波學校鮑思高同學會</h3>
          <a href="#" className="inline-block px-8 py-4 bg-white text-blue-900 font-bold rounded-full hover:bg-blue-50 shadow-lg">下載入會申請表</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

interface PageProps { searchParams: Promise<{ preview?: string }>; }
export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  if (resolvedParams.preview === 'tkp2026') {
    const latestNews = await fetchLatestNews();
    return <MainHomePage latestNews={latestNews} />;
  }
  return <MaintenanceView />;
}
