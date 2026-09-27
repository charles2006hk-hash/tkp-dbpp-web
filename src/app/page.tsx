import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CardImage from '@/components/CardImage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 60;

// 獲取最新新聞
async function fetchLatestNews() {
  const newsRef = collection(db, 'news');
  const q = query(newsRef, orderBy('createdAt', 'desc'), limit(3));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
}

// 🌟 新增：獲取「關於我們」資料
async function fetchAboutData() {
  try {
    const docSnap = await getDoc(doc(db, 'pages', 'about'));
    if (docSnap.exists()) return docSnap.data();
    return null;
  } catch (error) {
    console.error("Fetch about error:", error);
    return null;
  }
}

function MaintenanceView() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 px-4 text-center">
      <div className="relative w-24 h-28 mb-6">
        <Image src="/logo.png" alt="鄧鏡波學校 Logo" fill className="object-contain" priority />
      </div>
      <h1 className="text-3xl font-extrabold text-blue-900 mb-4 tracking-tight">鄧鏡波學校鮑思高同學會</h1>
      <p className="text-lg text-slate-500 max-w-md mx-auto mb-8">全新校友會網站正在進行升級與測試。<br />敬請期待，我們即將以全新面貌與各位校友見面。</p>
      <div className="h-1 w-24 bg-blue-600 rounded-full mx-auto animate-pulse"></div>
    </div>
  );
}

function MainHomePage({ latestNews, aboutData }: { latestNews: any[], aboutData: any }) {
  
  // ==========================================
  // 🧠 智能解析器：將 CMS 的單一 HTML 拆解為雙欄 UI
  // ==========================================
  let introHtml = '';
  let committeeMembers: { role: string, name: string }[] = [];

  if (aboutData?.content) {
    // 1. 利用分隔線 <hr> 將內容分為上下兩半 (對應首頁的左右兩欄)
    const parts = aboutData.content.split(/<hr[^>]*>/);
    
    // 2. 左半部：介紹文字 (移除 CMS 中重複的 H3 標題)
    introHtml = (parts[0] || '').replace(/<h3>.*?<\/h3>/, '').trim();

    // 3. 右半部：解析幹事會名單
    if (parts.length > 1) {
      const rawCommitteeHtml = parts[1];
      // 利用 Regex 抓取 <b>職位</b>：姓名 的格式
      const regex = /<b>(.*?)<\/b>[：:](.*?)(?:<br\s*\/?>|<\/p>|$)/g;
      let match;
      while ((match = regex.exec(rawCommitteeHtml)) !== null) {
        committeeMembers.push({ 
          role: match[1].replace(/<[^>]+>/g, '').trim(), // 清除多餘的 HTML 標籤
          name: match[2].replace(/<[^>]+>/g, '').trim() 
        });
      }
    }
  }

  // Fallback 預設資料 (若解析失敗或無資料時顯示)
  if (!introHtml) {
    introHtml = '<p>「教育是一件內心的事情。」 作為慈幼會創辦人聖若望·鮑思高（St. John Bosco）畢生致力於青少年的教育與關懷。他提倡的「預防教育法」——以理智、宗教、仁愛為核心，深深影響了鄧鏡波學校的辦學理念。</p><br/><p>本會冠以「鮑思高」之名，旨在提醒所有畢業校友，無論身處社會何方，皆應秉持母校教誨，關愛弱勢，熱心服務。</p>';
  }
  if (committeeMembers.length === 0) {
    committeeMembers = [
      { role: '會長', name: '李小明' }, { role: '副會長', name: '張大志' },
      { role: '秘書長', name: '陳建國' }, { role: '司庫', name: '黃家輝' },
    ];
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <Header />
      
      {/* 主視覺區 */}
      <section className="relative bg-blue-900 py-16 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-blue-900 to-blue-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-4 md:mb-6 tracking-tight drop-shadow-md leading-tight">
            立己立人 <br className="hidden md:block" /><span className="text-blue-300">We Love, We Care</span>
          </h2>
          <p className="mt-4 text-base md:text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed px-2">
            傳承鮑思高精神，凝聚舊生力量。歡迎回到鄧鏡波學校鮑思高同學會的大家庭，與昔日同窗攜手共創未來。
          </p>
          <div className="mt-8 md:mt-10 flex justify-center gap-4">
            <Link href="/news" className="px-6 py-3 md:px-8 md:py-3 bg-white text-blue-900 font-bold rounded-full hover:bg-blue-50 transition-all shadow-lg hover:-translate-y-0.5 text-sm md:text-base">
              瀏覽最新動態
            </Link>
          </div>
        </div>
      </section>

      {/* 🌟 關於母校與鮑思高精神 (已整合動態資料與靜態 UI) */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            
            {/* 左側：介紹文字 */}
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-6 relative inline-flex items-center gap-3">
                <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain" />
                <span>母校與鮑思高精神</span>
                <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
              </h3>
              
              {/* 使用 prose 設定基礎字體大小與顏色，並將 CMS HTML 注入 */}
              <div 
                className="prose prose-blue prose-p:text-base md:prose-p:text-lg prose-p:text-slate-600 prose-p:leading-relaxed max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: introHtml }}
              />
            </div>
            
            {/* 右側：幹事會列表 (保留原本的精美 UI 排版) */}
            <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">本屆幹事會 (Committee)</h4>
              <ul className="space-y-4 text-sm md:text-base text-slate-700">
                {committeeMembers.map((member, idx) => (
                  <li key={idx} className={`flex justify-between ${idx !== committeeMembers.length - 1 ? 'border-b border-slate-200 pb-3' : ''}`}>
                    <span className="font-semibold text-slate-800">{member.role}</span>
                    <span className="text-slate-600">{member.name}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 text-right">
                <Link href="/about" className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-800 text-sm transition-colors">
                  查看完整架構 &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 年度活動模組 */}
      <section id="events" className="py-16 md:py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-16 gap-4">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
                <h3 className="text-2xl md:text-3xl font-extrabold">近期活動與聚會</h3>
              </div>
              <p className="text-sm md:text-base text-slate-400 pl-11">重溫昔日情誼，支持母校發展</p>
            </div>
            <Link href="/events" className="hidden sm:inline-flex items-center text-blue-400 font-semibold hover:text-blue-300 transition-colors">
              查看全部活動 &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { title: "2026 校友會週年大會 (AGM)", date: "2026年11月", desc: "誠邀各位會員出席，共商會務發展及票選新一屆幹事。" },
              { title: "鄧鏡波盃 舊生籃球邀請賽", date: "2026年12月", desc: "穿上波衫，重返修院球場，與師兄弟切磋球技。" },
              { title: "鮑思高瞻禮感恩祭暨舊生晚宴", date: "2027年1月", desc: "紀念會祖聖若望·鮑思高，齊聚一堂感念恩師教導。" },
            ].map((event, idx) => (
              <Link 
                href="/events" 
                key={idx} 
                className="group block bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-700 hover:border-blue-500 hover:bg-slate-800/80 transition-all cursor-pointer"
              >
                <div className="text-blue-400 font-bold tracking-wider mb-2 text-sm">{event.date}</div>
                <h4 className="text-lg md:text-xl font-bold mb-3 group-hover:text-blue-300 transition-colors">{event.title}</h4>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">{event.desc}</p>
              </Link>
            ))}
          </div>
          {/* 手機版查看全部按鈕 */}
          <div className="mt-8 text-center sm:hidden">
            <Link href="/events" className="inline-block px-6 py-3 border border-slate-700 text-white font-bold rounded-lg w-full hover:bg-slate-800">
              查看全部活動
            </Link>
          </div>
        </div>
      </section>

      {/* 最新動態預覽 */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain" />
              <h3 className="text-2xl md:text-3xl font-extrabold text-blue-900">校友會動態</h3>
            </div>
            <Link href="/news" className="hidden sm:inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
              查看全部新聞 &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {latestNews.map((post) => (
              <Link key={post.id} href={`/news/${post.id}`} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardImage imageUrl={post.imageUrl} title={post.title} isVideo={post.isVideo} />
                <div className="p-5 md:p-6 flex flex-col flex-grow">
                  <time className="text-xs font-bold text-blue-600 mb-2 block tracking-wider">{post.date}</time>
                  <h4 className="text-base md:text-lg font-bold text-slate-800 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600">{post.title}</h4>
                </div>
              </Link>
            ))}
          </div>
          {/* 手機版查看更多按鈕 */}
          <div className="mt-8 text-center sm:hidden">
            <Link href="/news" className="inline-block px-6 py-3 bg-blue-100 text-blue-700 font-bold rounded-lg w-full">
              查看全部新聞
            </Link>
          </div>
        </div>
      </section>

      {/* 招募與加入模組 */}
      <section id="membership" className="py-16 md:py-20 bg-blue-600 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-6">歡迎加入鄧鏡波學校鮑思高同學會</h3>
          <a href="/membership" className="inline-block px-6 md:px-8 py-3 md:py-4 bg-white text-blue-900 font-bold rounded-full hover:bg-blue-50 shadow-lg text-sm md:text-base">了解更多</a>
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
    const aboutData = await fetchAboutData(); // 同步獲取 CMS 資料
    return <MainHomePage latestNews={latestNews} aboutData={aboutData} />;
  }
  return <MaintenanceView />;
}
