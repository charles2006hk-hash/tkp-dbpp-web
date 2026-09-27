import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 60; // ISR 快取

async function getAboutContent() {
  try {
    const docSnap = await getDoc(doc(db, 'pages', 'about'));
    if (docSnap.exists()) return docSnap.data();
    return null;
  } catch (error) {
    console.error("Fetch about error:", error);
    return null;
  }
}

export default async function AboutPage() {
  const content = await getAboutContent();

  // 取得結構化數據，若無則使用預設值
  const introText = content?.intro || "「教育是一件內心的事情。」 作為慈幼會創辦人聖若望·鮑思高（St. John Bosco）畢生致力於青少年的教育與關懷。\n\n本會冠以「鮑思高」之名，旨在提醒所有畢業校友，無論身處社會何方，皆應秉持母校教誨，關愛弱勢，熱心服務。";
  
  const committeeList = content?.committee && content.committee.length > 0 
    ? content.committee 
    : [
        { role: '會長', name: '李小明' }, { role: '副會長', name: '張大志' },
        { role: '秘書長', name: '陳建國' }, { role: '司庫', name: '黃家輝' }
      ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow py-16 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <header className="mb-12 text-center">
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Logo" width={80} height={80} className="object-contain" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            {content?.title || '鄧鏡波學校鮑思高同學會'}
          </h1>
          <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full"></div>
        </header>

        <article className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
          
          {/* 上半部：介紹文字 (使用 whitespace-pre-wrap 完美呈現換行) */}
          <div className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap mb-12">
            {introText}
          </div>

          {/* 下半部：幹事會名單 */}
          <div className="border-t border-slate-200 pt-10">
            <h3 className="text-2xl font-bold text-blue-900 mb-8 text-center">本屆幹事會名單</h3>
            <div className="max-w-xl mx-auto">
              <ul className="space-y-4">
                {committeeList.map((member: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-center bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <span className="font-bold text-slate-800 text-lg">{member.role}</span>
                    <span className="text-slate-600 font-medium text-lg">{member.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
        </article>
      </main>
      <Footer />
    </div>
  );
}
