'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy, addDoc, deleteDoc, doc, updateDoc, writeBatch, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import Image from 'next/image';

// -------------------------
// 介面定義 (Interfaces)
// -------------------------
interface ContentData {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  date: string;
  createdAt?: any;
  youtubeUrl?: string;
  tags?: string[];
  status?: 'upcoming' | 'past';
  eventDateTime?: string;
  contactInfo?: string;
  notificationEmail?: string;
  registrationUrl?: string;
}

interface RegistrationData {
  id: string;
  name: string;
  phone: string;
  email: string;
  gradYear: string;
  remarks: string;
  createdAt: any;
}

export default function CMSDashboard() {
  // -------------------------
  // 狀態管理 (State)
  // -------------------------
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');
  const [dataList, setDataList] = useState<ContentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 編輯器狀態
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<ContentData>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Seeder 狀態
  const [isSeeding, setIsSeeding] = useState(false);

  // 報名名單 (Roster) 狀態
  const [viewingRosterFor, setViewingRosterFor] = useState<string | null>(null);
  const [rosterList, setRosterList] = useState<RegistrationData[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  // -------------------------
  // 生命週期與通用功能
  // -------------------------
  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // ⚠️ 資安提醒：上線前請務必將此處替換為 Firebase Auth signInWithEmailAndPassword
    setIsAuthenticated(true); 
  };

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

  // -------------------------
  // 報名名單功能 (Roster)
  // -------------------------
  const fetchRoster = async (eventId: string) => {
    setViewingRosterFor(eventId);
    setRosterLoading(true);
    try {
      const q = query(collection(db, 'event_registrations'), where('eventId', '==', eventId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RegistrationData[];
      // 前端做時間降序排序 (避免 Firebase index 建立要求)
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)); 
      setRosterList(data);
    } catch (error) {
      console.error("Fetch roster error:", error);
    } finally {
      setRosterLoading(false);
    }
  };

  // -------------------------
  // 內容 CRUD 功能
  // -------------------------
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const baseData = {
        title: currentPost.title || '',
        date: currentPost.date || new Date().toISOString().split('T')[0],
        content: currentPost.content || '',
        imageUrl: currentPost.imageUrl || '',
        createdAt: currentPost.createdAt || new Date(),
      };

      const postData = activeTab === 'news' 
        ? { 
            ...baseData, 
            youtubeUrl: currentPost.youtubeUrl || '', 
            tags: currentPost.tags || ['校友會動態'] 
          }
        : { 
            ...baseData, 
            status: currentPost.status || 'upcoming', 
            registrationUrl: currentPost.registrationUrl || '',
            eventDateTime: currentPost.eventDateTime || '',
            contactInfo: currentPost.contactInfo || '',
            notificationEmail: currentPost.notificationEmail || ''
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
      alert("儲存失敗，請檢查 Firestore 安全規則。");
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

  // -------------------------
  // 內建 Seeder 腳本
  // -------------------------
  const handleSeedEvents = async () => {
    const confirmMsg = "⚠️ 危險操作！\n\n這將會【清空】目前資料庫中所有的活動資料，並重新寫入 4 筆範例數據。\n請問確定要執行嗎？";
    if (!window.confirm(confirmMsg)) return;

    setIsSeeding(true);
    try {
      const eventsRef = collection(db, 'events');
      const snapshot = await getDocs(eventsRef);
      const batch = writeBatch(db);

      snapshot.docs.forEach((document) => {
        batch.delete(document.ref);
      });

      const sampleEvents = [
        {
          title: "2026 校友會週年大會 (AGM)", date: "2026-10-01", eventDateTime: "2026-11-15 14:00",
          content: "誠邀各位會員出席，共商會務發展及票選新一屆幹事。會後將備有茶點招待。\n\n流程：\n1. 會長致辭\n2. 財政報告\n3. 新一屆幹事選舉\n4. 自由交流與茶會",
          imageUrl: "", status: "upcoming", contactInfo: "陳秘書 9123-4567", notificationEmail: "admin@tkp-dbpp.org.hk", registrationUrl: "", createdAt: new Date()
        },
        {
          title: "鄧鏡波盃 舊生籃球邀請賽", date: "2026-10-15", eventDateTime: "2026-12-10 09:00",
          content: "穿上波衫，重返修院球場！歡迎各屆校友組隊參加，與師兄弟切磋球技，重溫熱血青春。\n\n報名費：每隊 $500\n名額：16 隊 (先到先得)",
          imageUrl: "", status: "upcoming", contactInfo: "李副會長 9876-5432", notificationEmail: "admin@tkp-dbpp.org.hk", registrationUrl: "", createdAt: new Date()
        },
        {
          title: "鮑思高瞻禮感恩祭暨舊生晚宴", date: "2026-11-01", eventDateTime: "2027-01-31 18:00",
          content: "紀念會祖聖若望·鮑思高，齊聚一堂感念恩師教導。晚宴將設有大抽獎及校友表演環節。\n\n地點：母校大禮堂\n餐券：每位 $300 (大小同價)",
          imageUrl: "", status: "upcoming", contactInfo: "黃司庫 6123-8888", notificationEmail: "", registrationUrl: "", createdAt: new Date()
        },
        {
          title: "2025 校友會新春盆菜宴", date: "2025-01-10", eventDateTime: "2025-02-15 19:00",
          content: "超過三百名校友及老師聚首母校操場，共享傳統盆菜，氣氛熱鬧，圓滿結束。感謝各位校友的鼎力支持！\n\n當晚除了豐富的盆菜，還有師生才藝表演以及幸運大抽獎，讓大家在歡笑聲中度過了一個難忘的夜晚。",
          imageUrl: "", status: "past", contactInfo: "", notificationEmail: "", registrationUrl: "", createdAt: new Date()
        }
      ];

      sampleEvents.forEach((event) => {
        const newDocRef = doc(eventsRef);
        batch.set(newDocRef, event);
      });

      await batch.commit();
      alert("✅ 清洗與導入成功！");
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert(`❌ 導入失敗：${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // -------------------------
  // 工具函數
  // -------------------------
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
        const maxDim = 1024;

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

  // -------------------------
  // 視圖 A: 登入
  // -------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">TKP</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">後台管理系統</h2>
          <form onSubmit={handleLogin} className="space-y-4 text-left mt-8">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
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

  // -------------------------
  // 視圖 B: CMS 儀表板
  // -------------------------
  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs">TKP</div>
          <span className="font-bold tracking-wider">CMS Admin</span>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <button onClick={() => {setActiveTab('news'); setIsEditing(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="font-semibold">新聞動態管理</span>
          </button>
          <button onClick={() => {setActiveTab('events'); setIsEditing(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'events' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span className="font-semibold">活動花絮與報名</span>
          </button>
        </nav>
      </aside>

      <main className="flex-grow md:ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-end mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold text-slate-900">
                {activeTab === 'news' ? '新聞動態管理' : '活動花絮與報名管理'}
              </h1>
              {!isEditing && activeTab === 'events' && (
                <button 
                  onClick={handleSeedEvents} 
                  disabled={isSeeding}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  {isSeeding ? '處理中...' : '🧹 重置範例資料'}
                </button>
              )}
            </div>
            {!isEditing && (
              <button onClick={() => { setCurrentPost({}); setIsEditing(true); }} className={`text-white px-6 py-2 rounded-lg font-bold shadow-md ${activeTab === 'news' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
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
                    <label className="block text-sm font-semibold text-slate-700 mb-1">建立/發佈日期 *</label>
                    <input type="date" required value={currentPost.date || ''} onChange={e => setCurrentPost({...currentPost, date: e.target.value})} className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">封面圖片 (上傳會自動壓縮)</label>
                  <div className="flex items-center gap-4 mb-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-200 font-medium">
                      {isUploading ? '壓縮上傳中...' : '選擇圖片上傳'}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <input type="url" value={currentPost.imageUrl || ''} onChange={e => setCurrentPost({...currentPost, imageUrl: e.target.value})} placeholder="或直接貼上圖片網址" className="flex-grow border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 outline-none" />
                  </div>
                  {currentPost.imageUrl && (
                    <div className="mt-2 relative w-32 h-32 border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <Image src={currentPost.imageUrl} alt="預覽圖" fill className="object-cover" />
                    </div>
                  )}
                </div>

                {activeTab === 'news' ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">YouTube 影片 URL (選填)</label>
                    <input type="url" value={currentPost.youtubeUrl || ''} onChange={e => setCurrentPost({...currentPost, youtubeUrl: e.target.value})} placeholder="https://www.youtube.com/embed/..." className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                ) : (
                  <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100 space-y-4">
                    <h3 className="font-bold text-emerald-800 mb-2">活動專屬設定</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">活動狀態</label>
                        <select value={currentPost.status || 'upcoming'} onChange={e => setCurrentPost({...currentPost, status: e.target.value as 'upcoming' | 'past'})} className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none">
                          <option value="upcoming">即將舉辦 (開放報名)</option>
                          <option value="past">圓滿結束 (歷史回顧)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">活動舉辦時間 (例如: 2026-11-15 18:00)</label>
                        <input type="text" value={currentPost.eventDateTime || ''} onChange={e => setCurrentPost({...currentPost, eventDateTime: e.target.value})} placeholder="輸入活動時間" className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">聯絡人資訊 (選填)</label>
                        <input type="text" value={currentPost.contactInfo || ''} onChange={e => setCurrentPost({...currentPost, contactInfo: e.target.value})} placeholder="例如: 陳先生 91234567" className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">報名通知 Email (選填)</label>
                        <input type="email" value={currentPost.notificationEmail || ''} onChange={e => setCurrentPost({...currentPost, notificationEmail: e.target.value})} placeholder="admin@tkp-dbpp.org.hk" className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">外部報名連結 (選填，留空則啟用站內報名)</label>
                      <input type="url" value={currentPost.registrationUrl || ''} onChange={e => setCurrentPost({...currentPost, registrationUrl: e.target.value})} placeholder="https://forms.gle/..." className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-semibold text-slate-700">詳細內容 (Content) *</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => insertTextAtCursor('<b>粗體字</b>')} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300"><b>B</b></button>
                      <button type="button" onClick={() => insertTextAtCursor('\n<br/>\n')} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300">換行</button>
                      <button type="button" onClick={() => insertTextAtCursor('<a href="網址" target="_blank" class="text-blue-600 underline">連結文字</a>')} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300">連結</button>
                    </div>
                  </div>
                  <textarea id="content-editor" required rows={12} value={currentPost.content || ''} onChange={e => setCurrentPost({...currentPost, content: e.target.value})} className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none whitespace-pre-wrap font-mono text-sm leading-relaxed"></textarea>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">取消</button>
                  <button type="submit" disabled={isLoading || isUploading} className={`px-8 py-2.5 text-white font-bold rounded-lg disabled:opacity-50 ${activeTab === 'news' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
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
                      <th className="p-4 w-32">發佈日期</th>
                      <th className="p-4">標題</th>
                      {activeTab === 'events' && <th className="p-4 w-32">活動狀態</th>}
                      <th className="p-4 w-40 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={activeTab === 'events' ? 4 : 3} className="p-8 text-center text-slate-400">載入中...</td></tr>
                    ) : dataList.length === 0 ? (
                      <tr><td colSpan={activeTab === 'events' ? 4 : 3} className="p-8 text-center text-slate-400">目前沒有資料，點擊右上角新增。</td></tr>
                    ) : (
                      dataList.map(post => (
                        <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4 whitespace-nowrap">{post.date}</td>
                          <td className="p-4 font-medium text-slate-900">{post.title}</td>
                          {activeTab === 'events' && (
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${post.status === 'upcoming' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {post.status === 'upcoming' ? '即將舉辦' : '圓滿結束'}
                              </span>
                            </td>
                          )}
                          <td className="p-4 text-right space-x-3">
                            {/* 活動專屬的查看名單按鈕 */}
                            {activeTab === 'events' && (
                              <button onClick={() => fetchRoster(post.id)} className="text-emerald-600 font-semibold hover:underline mr-2">名單</button>
                            )}
                            <button onClick={() => { setCurrentPost(post); setIsEditing(true); }} className="text-blue-600 font-semibold hover:underline">編輯</button>
                            <button onClick={() => handleDelete(post.id)} className="text-red-500 font-semibold hover:underline">刪除</button>
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

      {/* 報名名單 Modal (CMS端) */}
      {viewingRosterFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">報名名單 (共 {rosterList.length} 人)</h3>
              <button onClick={() => setViewingRosterFor(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">
              {rosterLoading ? (
                <p className="text-center text-slate-500 py-8">載入名單中...</p>
              ) : rosterList.length === 0 ? (
                <p className="text-center text-slate-500 py-8">目前尚無人報名</p>
              ) : (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-100 text-slate-800">
                    <tr>
                      <th className="p-3 rounded-tl-lg">姓名</th>
                      <th className="p-3">電話</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">畢業年</th>
                      <th className="p-3 rounded-tr-lg">備註</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rosterList.map(user => (
                      <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{user.name}</td>
                        <td className="p-3">{user.phone}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">{user.gradYear || '-'}</td>
                        <td className="p-3">{user.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
