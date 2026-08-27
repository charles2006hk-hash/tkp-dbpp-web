'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';

// 定義新聞資料結構
interface NewsPost {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  youtubeUrl: string;
  tags: string[];
  date: string;
  createdAt?: any;
}

export default function CMSDashboard() {
  // 狀態管理
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');
  const [newsList, setNewsList] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 編輯器狀態
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<NewsPost>>({});

  // 1. 模擬登入驗證 (後續需替換為 Firebase Auth onAuthStateChanged)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 🚧 TODO: 接入 signInWithEmailAndPassword
    setIsAuthenticated(true);
    fetchNews();
  };

  // 2. 獲取資料
  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NewsPost[];
      setNewsList(data);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 儲存/更新資料
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const postData = {
        title: currentPost.title || '',
        date: currentPost.date || new Date().toISOString().split('T')[0],
        content: currentPost.content || '',
        imageUrl: currentPost.imageUrl || '',
        youtubeUrl: currentPost.youtubeUrl || '',
        tags: currentPost.tags || ['校友會公告'],
        createdAt: currentPost.createdAt || new Date(),
      };

      if (currentPost.id) {
        // 更新
        await updateDoc(doc(db, 'news', currentPost.id), postData);
      } else {
        // 新增
        await addDoc(collection(db, 'news'), postData);
      }
      setIsEditing(false);
      fetchNews();
    } catch (error) {
      console.error("Error saving document: ", error);
      alert("儲存失敗，請檢查權限設定 (Firestore Rules)");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. 刪除資料
  const handleDelete = async (id: string) => {
    if (!window.confirm('確定要刪除這筆資料嗎？刪除後無法復原。')) return;
    try {
      await deleteDoc(doc(db, 'news', id));
      fetchNews();
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  // ==========================================
  // 視圖 A: 登入畫面
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-inner">
            TKP
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">後台管理系統</h2>
          <p className="text-sm text-slate-500 mb-8">請輸入管理員憑證登入系統</p>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input type="email" required defaultValue="admin@tkp-dbpp.org.hk" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input type="password" required defaultValue="password123" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-slate-50" />
            </div>
            <button type="submit" className="w-full bg-blue-900 text-white font-bold py-2.5 px-4 rounded-md hover:bg-blue-800 transition-colors mt-4 shadow-md">
              登入 (Login)
            </button>
          </form>
          <div className="mt-6">
            <Link href="/" className="text-sm text-blue-600 hover:underline">&larr; 返回前台首頁</Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 視圖 B: CMS Dashboard
  // ==========================================
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* 側邊欄 (Sidebar) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs">TKP</div>
          <span className="font-bold tracking-wider">CMS Admin</span>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <button onClick={() => {setActiveTab('news'); setIsEditing(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="font-semibold">新聞動態管理</span>
          </button>
          <button onClick={() => {setActiveTab('events'); setIsEditing(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'events' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="font-semibold">活動花絮管理</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => setIsAuthenticated(false)} className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-colors">
            登出 (Logout)
          </button>
        </div>
      </aside>

      {/* 主內容區 (Main Content) */}
      <main className="flex-grow md:ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          
          <header className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                {activeTab === 'news' ? '新聞動態管理' : '活動花絮管理'}
              </h1>
              <p className="text-slate-500 mt-2">管理前台顯示的數據與內容</p>
            </div>
            {!isEditing && (
              <button 
                onClick={() => { setCurrentPost({}); setIsEditing(true); }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors"
              >
                + 新增內容
              </button>
            )}
          </header>

          {/* 區塊：編輯表單 */}
          {isEditing ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">{currentPost.id ? '編輯內容' : '新增內容'}</h2>
                <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 font-medium">取消</button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">標題 (Title) *</label>
                    <input type="text" required value={currentPost.title || ''} onChange={e => setCurrentPost({...currentPost, title: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">發佈日期 (Date) *</label>
                    <input type="date" required value={currentPost.date || ''} onChange={e => setCurrentPost({...currentPost, date: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">圖片 URL (Firebase Storage / 外部圖床)</label>
                  <input type="url" value={currentPost.imageUrl || ''} onChange={e => setCurrentPost({...currentPost, imageUrl: e.target.value})} placeholder="https://..." className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">YouTube 影片 URL (選填，優先顯示)</label>
                  <input type="url" value={currentPost.youtubeUrl || ''} onChange={e => setCurrentPost({...currentPost, youtubeUrl: e.target.value})} placeholder="https://www.youtube.com/embed/..." className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  <p className="text-xs text-slate-500 mt-1">請填寫 embed 格式的網址，例如: https://www.youtube.com/embed/影片ID</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">內容 (Content) *</label>
                  <textarea required rows={8} value={currentPost.content || ''} onChange={e => setCurrentPost({...currentPost, content: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none whitespace-pre-wrap"></textarea>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">
                    取消
                  </button>
                  <button type="submit" disabled={isLoading} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50">
                    {isLoading ? '儲存中...' : '儲存發佈'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* 區塊：資料列表 */
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-4 w-24">日期</th>
                      <th className="p-4">標題</th>
                      <th className="p-4 w-32">媒體類型</th>
                      <th className="p-4 w-40 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-400">載入中...</td></tr>
                    ) : newsList.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-400">目前沒有資料</td></tr>
                    ) : (
                      newsList.map(post => (
                        <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-4 whitespace-nowrap">{post.date}</td>
                          <td className="p-4 font-medium text-slate-900">{post.title}</td>
                          <td className="p-4">
                            {post.youtubeUrl ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">YouTube</span>
                            ) : post.imageUrl ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">Image</span>
                            ) : (
                              <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-bold">Text</span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-3">
                            <button onClick={() => { setCurrentPost(post); setIsEditing(true); }} className="text-blue-600 hover:text-blue-800 font-semibold">編輯</button>
                            <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700 font-semibold">刪除</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
