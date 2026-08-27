import Image from 'next/image';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // 引入集中管理的 db 實例
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Next.js 15: params 是一個 Promise
export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const docRef = doc(db, 'news', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    notFound();
  }

  const post = { id: docSnap.id, ...docSnap.data() } as any;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow py-16 px-4 md:px-8 max-w-4xl mx-auto w-full">
        
        {/* 標題與 Metadata */}
        <header className="mb-8 text-center">
          <div className="mb-4 flex justify-center gap-2">
            {post.tags ? post.tags.map((tag: string) => (
              <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{tag}</span>
            )) : (
              <span className="bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded">校友會公告</span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">{post.title}</h1>
          <div className="text-slate-500 font-medium">{post.date}</div>
        </header>

        {/* 媒體呈現區塊：優先顯示 YouTube，否則顯示圖片 */}
        <div className="relative w-full aspect-video bg-slate-200 rounded-2xl overflow-hidden mb-12 shadow-lg">
          {post.youtubeUrl ? (
            <iframe 
              src={post.youtubeUrl} 
              title="YouTube video player" 
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen 
            />
          ) : post.imageUrl ? (
            <Image src={post.imageUrl} alt={post.title} fill className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
              <span className="text-4xl font-black text-slate-300 tracking-widest select-none">TKP-DBPP</span>
            </div>
          )}
        </div>

        {/* 文章內容：保留換行符號 */}
        <article className="prose prose-lg prose-blue mx-auto text-slate-700 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </article>

        {/* 歷史資料回溯按鈕 (舊 Facebook 資料使用) */}
        {post.facebookUrl && (
          <div className="mt-16 text-center border-t border-slate-200 pt-8">
            <a href={post.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-blue-600 hover:text-blue-800 font-semibold border border-blue-200 rounded-full px-6 py-2 hover:bg-blue-50 transition-colors">
              在 Facebook 查看原始貼文
            </a>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
