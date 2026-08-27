import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';

// 1. 初始化 Firebase Client SDK (唯讀模式，放明碼無安全風險)
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

// 定義資料介面
interface NewsPost {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  isVideo: boolean;
  facebookUrl: string;
  date: string;
}

// 2. 獲取資料 (Next.js 會在 Server-side 執行並緩存)
async function fetchNews(): Promise<NewsPost[]> {
  const newsRef = collection(db, 'news');
  const q = query(newsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as NewsPost[];
}

export default async function NewsPage() {
  const newsList = await fetchNews();

  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 標題區塊 */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            校友會最新動態
          </h1>
          <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full"></div>
        </header>

        {/* 卡片網格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {newsList.map((post) => (
            <a
              key={post.id}
              href={post.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* 多媒體 / 預設佔位圖 區塊 */}
              <div className="relative h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex-shrink-0">
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  // 沒有圖片時的優雅 Fallback 設計
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                    <span className="text-2xl font-black text-slate-300 tracking-widest">
                      TKP-DBPP
                    </span>
                  </div>
                )}

                {/* 影片播放圖示提示 */}
                {post.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4l12 6-12 6z"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* 內文區塊 */}
              <div className="p-5 flex flex-col flex-grow">
                <time className="text-xs font-bold text-blue-600 mb-2 block tracking-wider">
                  {post.date}
                </time>
                <h2 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed flex-grow">
                  {post.content}
                </p>
                
                {/* 底部按鈕 */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span className="group-hover:text-blue-600 transition-colors">閱讀全文 &rarr;</span>
                  <span className="bg-slate-100 px-2 py-1 rounded text-slate-500">Facebook</span>
                </div>
              </div>
            </a>
          ))}
        </div>
        
      </div>
    </main>
  );
}
