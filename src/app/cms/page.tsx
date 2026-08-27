import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CMSPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">後台管理系統 (CMS)</h2>
          <p className="text-sm text-slate-500 mb-8">請輸入管理員憑證登入系統。此區塊將與 Firebase Auth 整合以確保資料庫安全寫入。</p>
          
          <form className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input type="email" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" placeholder="admin@tkp-dbpp.org.hk" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input type="password" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>
            <button type="button" className="w-full bg-blue-900 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-800 transition-colors mt-4">
              登入 (Login)
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
