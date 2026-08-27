import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import CardImage from '@/components/CardImage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

async function fetchNews() {
  const newsRef = collection(db, 'news');
  const q = query(newsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
}

export default async function NewsPage() {
  const newsList = await fetchNews();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">校友會最新動態</h1>
            <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full"></div>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newsList.map((post) => (
              <a key={post.id} href={post.facebookUrl} target="_blank" rel="noopener noreferrer" className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardImage imageUrl={post.imageUrl} title={post.title} isVideo={post.isVideo} />
                <div className="p-5 flex flex-col flex-grow">
                  <time className="text-xs font-bold text-blue-600 mb-2 block tracking-wider">{post.date}</time>
                  <h2 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{post.title}</h2>
                  <p className="text-sm text-slate-500 line-clamp-3">{post.content}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
