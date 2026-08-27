import Link from 'next/link';
import Image from 'next/image';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import CardImage from '@/components/CardImage';

// 1. Firebase Client 配置 (唯讀公開數據)
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

export const revalidate = 60; // ISR：每 60 秒更新一次首頁快取

// 2. 獲取最新 3 筆新聞顯示在首頁
async function fetchLatestNews() {
  const newsRef = collection(db, 'news');
  const q = query(newsRef, orderBy('createdAt', 'desc'), limit(3));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];
}

export default async function HomePage() {
  const latestNews = await fetchLatestNews();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- 導覽列 (Navbar) --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              {/* 請在 public 資料夾放入 logo.png */}
              <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-inner">
                TKP
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900 tracking-tight">鄧鏡波學校</h1>
                <p className="text-sm font-semibold text-blue-600">鮑思高同學會</p>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-blue-900 font-medium hover:text-blue-600 transition-colors">首頁</Link>
              <Link href="/news" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">最新動態</Link>
              <Link href="#about" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">關於我們</Link>
              <Link href="#contact" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">聯絡資訊</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- 主視覺區 (Hero Section) --- */}
      <section className="relative bg-blue-900 py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-blue-900 to-blue-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
            傳承鮑思高精神 <br className="hidden md:block" />
            <span className="text-blue-300">凝聚舊生力量</span>
          </h2>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
            立己立人，服務社群。歡迎回到鄧鏡波學校鮑思高同學會的大家庭，與昔日同窗攜手共創未來。
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/news" className="px-8 py-3 bg-white text-blue-900 font-bold rounded-full hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              瀏覽最新動態
            </Link>
            <Link href="#join" className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all">
              加入同學會
            </Link>
          </div>
        </div>
      </section>

      {/* --- 鮑思高精神區塊 (Don Bosco Spirit) --- */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-extrabold text-blue-900 mb-6 relative inline-block">
                聖若望·鮑思高
                <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                「教育是一件內心的事情。」 作為慈幼會的創辦人，聖若望·鮑思高（St. John Bosco）畢生致力於青少年的教育與關懷。他提倡的「預防教育法」——以理智、宗教、仁愛為核心，深深影響了鄧鏡波學校的辦學理念。
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                本會冠以「鮑思高」之名，旨在提醒所有畢業校友，無論身處社會何方，皆應秉持母校教誨，關愛弱勢，熱心服務，活出慈幼青年的特質。
              </p>
            </div>
            {/* 預留給鮑思高神父的圖片或相關插圖 */}
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
               <span className="text-slate-400 font-medium tracking-widest">DON BOSCO IMAGE PLACEHOLDER</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- 最新動態預覽 (Latest News) --- */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-3xl font-extrabold text-blue-900">校友會動態</h3>
              <p className="mt-2 text-slate-500">掌握母校與舊生會的最新資訊</p>
            </div>
            <Link href="/news" className="hidden sm:inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
              查看全部新聞 <span aria-hidden="true" className="ml-1">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestNews.map((post) => (
              <Link
                key={post.id}
                href={post.facebookUrl || `/news`}
                target="_blank"
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <CardImage imageUrl={post.imageUrl} title={post.title} isVideo={post.isVideo} />
                <div className="p-6 flex flex-col flex-grow">
                  <time className="text-xs font-bold text-blue-600 mb-2 block tracking-wider">{post.date}</time>
                  <h4 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{post.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{post.content}</p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-10 text-center sm:hidden">
            <Link href="/news" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800">
              查看全部新聞 &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* --- 頁尾與隱藏 CMS 入口 (Footer) --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} 鄧鏡波學校鮑思高同學會. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 relative">
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">聯絡我們</a>
            
            {/* 🚨 隱藏的 CMS 入口：極端低調的亮點，游標移過去才會變成白色 */}
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

    </div>
  );
}
