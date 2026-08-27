'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';

// 定義通用的資料結構 (新聞與活動共用)
interface ContentData {
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');
  const [dataList, setDataList] = useState<ContentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<ContentData>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化或切換 Tab 時拉取對應集合的數據
  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true); // TODO: 替換為 Firebase Auth
  };

  // 動態讀取 news 或 events 集合
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, activeTab), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setDataList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContentData[]);
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

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
        tags: currentPost.tags || (activeTab === 'news' ? ['新聞'] : ['活動']),
        createdAt: currentPost.createdAt || new Date(),
      };

      if (currentPost.id) {
        await updateDoc(doc(db, activeTab, currentPost.id), postData);
      } else {
        await addDoc(collection(db, activeTab), postData);
      }
      setIsEditing(false);
      fetchData();
    } catch (error) {
      console.error("Save error: ", error);
      alert("儲存失敗，請檢查 Firestore 權限。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('確定要刪除嗎？此動作無法復原。')) return;
    try {
      await deleteDoc(doc(db, activeTab, id));
      fetchData();
    } catch (error) {
      console.error("Delete error: ", error);
    }
  };

  // 圖片壓縮與上傳 (利用 HTML5 Canvas)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 1024; // 限制最大寬高

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height *= maxDim / width));
            width = maxDim;
          } else {
            width = Math.round((width *= maxDim / height));
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // 壓縮為 70% 質量的 JPEG (約 100kb 左右)
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const storageRef = ref(storage, `${activeTab}/${Date.now()}_compressed.jpg`);
          try {
            const uploadTask = await uploadBytesResumable(storageRef, blob);
            const downloadURL = await getDownloadURL(uploadTask.ref);
            setCurrentPost(prev => ({ ...prev, imageUrl: downloadURL }));
          } catch (error) {
            console.error("Upload error:", error);
            alert("上傳失敗，請檢查 Storage 權限。");
          } finally {
            setIsUploading(false);
          }
        }, 'image/jpeg', 0.7);
      };
    };
  };

  // 簡易文本編輯工具 (插入 HTML 標籤)
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = currentPost.content || '';
    const newVal = currentVal.substring(0, start) + textToInsert + currentVal.substring(end);
    
    setCurrentPost({...currentPost, content: newVal});
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  // ==========================================
  // 視圖 A: 登入畫面
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">TKP</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">後台管理系統</h2>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left mt-8">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              {/* 修正了文字顏色 text-slate-900 */}
              <input type="email" required defaultValue="admin@tkp-dbpp.org.hk" className="mt-1 block w-full rounded-md border-slate-300 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input type="password" required defaultValue="password123" className="mt-1 block w-full rounded-md border-slate-300 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>
            <button type="submit" className="w-full bg-blue-900 text-white font-bold py-2.5 px-4 rounded-md hover:bg-blue-800 transition-colors mt-4">
              登入 (Login)
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // 視圖 B: CMS Dashboard
  // ==========================================
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs">TKP</div>
          <span className="font-bold tracking-wider">CMS Admin</span>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <button onClick={() => {setActiveTab('news'); setIsEditing(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="font-semibold">新聞動態管理</span>
          </button>
          <button onClick={() => {setActiveTab('events'); setIsEditing(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'events' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="font-semibold">活動花絮管理</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow md:ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          
          <header className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                {activeTab === 'news' ? '新聞動態管理' : '活動花絮管理'}
              </h1>
            </div>
            {!isEditing && (
              <button onClick={() => { setCurrentPost({}); setIsEditing(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md">
                + 新增內容
              </button>
            )}
          </header>

          {isEditing ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">{currentPost.id ? '編輯內容' : '新增內容'}</h2>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">標題 (Title) *</label>
                    <input type="text" required value={currentPost.title || ''} onChange={e => setCurrentPost({...currentPost, title: e.target.value})} className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">發佈日期 (Date) *</label>
                    <input type="date" required value={currentPost.date || ''} onChange={e => setCurrentPost({...currentPost, date: e.target.value})} className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                {/* 圖片上傳區塊 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">封面圖片 (上傳會自動壓縮)</label>
                  <div className="flex items-center gap-4 mb-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-200 font-medium">
                      {isUploading ? '壓縮上傳中...' : '選擇圖片上傳'}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <input type="url" value={currentPost.imageUrl || ''} onChange={e => setCurrentPost({...currentPost, imageUrl: e.target.value})} placeholder="或直接貼上圖片網址" className="flex-grow border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 outline-none" />
                  </div>
                  {/* 預覽小圖 */}
                  {currentPost.imageUrl && (
                    <div className="mt-2 relative w-32 h-32 border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <Image src={currentPost.imageUrl} alt="預覽圖" fill className="object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">YouTube 影片 URL (選填)</label>
                  <input type="url" value={currentPost.youtubeUrl || ''} onChange={e => setCurrentPost({...currentPost, youtubeUrl: e.target.value})} placeholder="https://www.youtube.com/embed/..." className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                {/* 內容與簡單編輯器 */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-semibold text-slate-700">內容 (Content) *</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => insertTextAtCursor('<b>粗體字</b>')} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300"><b>B</b></button>
                      <button type="button" onClick={() => insertTextAtCursor('\n<br/>\n')} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300">換行</button>
                      <button type="button" onClick={() => insertTextAtCursor('<a href="網址" target="_blank" class="text-blue-600 underline">連結文字</a>')} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300">連結</button>
                    </div>
                  </div>
                  <textarea id="content-editor" required rows={12} value={currentPost.content || ''} onChange={e => setCurrentPost({...currentPost, content: e.target.value})} className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none whitespace-pre-wrap font-mono text-sm leading-relaxed"></textarea>
                  <p className="text-xs text-slate-500 mt-1">支援直接換行或使用簡易 HTML 標籤排版。</p>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">取消</button>
                  <button type="submit" disabled={isLoading || isUploading} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {isLoading ? '儲存中...' : '儲存發佈'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-4 w-32">日期</th>
                      <th className="p-4">標題</th>
                      <th className="p-4 w-32 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={3} className="p-8 text-center text-slate-400">載入中...</td></tr>
                    ) : dataList.length === 0 ? (
                      <tr><td colSpan={3} className="p-8 text-center text-slate-400">目前沒有資料</td></tr>
                    ) : (
                      dataList.map(post => (
                        <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4 whitespace-nowrap">{post.date}</td>
                          <td className="p-4 font-medium text-slate-900">{post.title}</td>
                          <td className="p-4 text-right space-x-3">
                            <button onClick={() => { setCurrentPost(post); setIsEditing(true); }} className="text-blue-600 font-semibold">編輯</button>
                            <button onClick={() => handleDelete(post.id)} className="text-red-500 font-semibold">刪除</button>
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
