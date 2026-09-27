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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow py-16 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <header className="mb-12 text-center">
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Logo" width={80} height={80} className="object-contain" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            {content?.title || '關於我們'}
          </h1>
          <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full"></div>
        </header>

        <article className="prose prose-lg prose-blue mx-auto text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
          {content?.content ? (
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          ) : (
            <p className="text-center text-slate-500">內容建置中，請稍後再回來查看。</p>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
}
