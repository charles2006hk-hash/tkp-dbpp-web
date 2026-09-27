'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { collection, getDocs, query, orderBy, addDoc, deleteDoc, doc, updateDoc, writeBatch, where, getDoc, setDoc } from 'firebase/firestore';
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
  studentClass?: string;
  studentId?: string;
  remarks?: string;
  status?: string;
  createdAt: any;
}

type TabType = 'news' | 'events' | 'about' | 'members';

export default function CMSDashboard() {
  // -------------------------
  // 狀態管理 (State)
  // -------------------------
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('news');
  const [dataList, setDataList] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  
  // 編輯器狀態
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 測試資料導入狀態
  const [isSeeding, setIsSeeding] = useState(false);

  // 活動報名名單 (Roster) 狀態
  const [viewingRosterFor, setViewingRosterFor] = useState<string | null>(null);
  const [rosterList, setRosterList] = useState<RegistrationData[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  // 手機版側邊欄開關狀態
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 🌟 會員管理系統專用狀態 (搜索、過濾、信息發佈)
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState('all'); // all | pending | approved | rejected
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageData, setMessageData] = useState({ subject: '', content: '' });

  // -------------------------
  // 生命週期與通用功能
  // -------------------------
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'news' || activeTab === 'events') fetchData();
      else if (activeTab === 'about') fetchAboutPage();
      else if (activeTab === 'members') fetchMembers();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // ⚠️ 資安提醒：上線前請務必將此處替換為 Firebase Auth signInWithEmailAndPassword 
    setIsAuthenticated(true); 
  };

  // 讀取動態與活動
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, activeTab), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setDataList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // 讀取「關於我們」單頁內容 (結構化資料)
  const fetchAboutPage = async () => {
    setIsLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'pages', 'about'));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentPost({
          id: 'about',
          title: data.title || '鄧鏡波學校鮑思高同學會',
          intro: data.intro || '「教育是一件內心的事情。」 作為慈幼會創辦人聖若望·鮑思高（St. John Bosco）畢生致力於青少年的教育與關懷。\n\n本會冠以「鮑思高」之名，旨在提醒所有畢業校友，無論身處社會何方，皆應秉持母校教誨，關愛弱勢，熱心服務。',
          committee: data.committee && data.committee.length > 0 ? data.committee : [
            { role: '會長', name: '李小明' },
            { role: '副會長', name: '張大志' },
            { role: '秘書長', name: '陳建國' },
            { role: '司庫', name: '黃家輝' }
          ]
        });
      } else {
        setCurrentPost({
          id: 'about',
          title: '鄧鏡波學校鮑思高同學會',
          intro: '「教育是一件內心的事情。」 作為慈幼會創辦人聖若望·鮑思高（St. John Bosco）畢生致力於青少年的教育與關懷。\n\n本會冠以「鮑思高」之名，旨在提醒所有畢業校友，無論身處社會何方，皆應秉持母校教誨，關愛弱勢，熱心服務。',
          committee: [
            { role: '會長', name: '李小明' }, { role: '副會長', name: '張大志' },
            { role: '秘書長', name: '陳建國' }, { role: '司庫', name: '黃家輝' }
          ]
        });
      }
      setIsEditing(true); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 讀取會員申請名單
  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'membership_applications'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setDataList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 讀取活動報名名單
  const fetchRoster = async (eventId: string) => {
    setViewingRosterFor(eventId);
    setRosterLoading(true);
    try {
      const q = query(collection(db, 'event_registrations'), where('eventId', '==', eventId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RegistrationData[];
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)); 
      setRosterList(data);
    } catch (error) {
      console.error("Fetch roster error:", error);
    } finally {
      setRosterLoading(false);
    }
  };

  const updateMemberStatus = async (id: string, newStatus: string) => {
    if (!window.confirm(`確定將此申請標記為 ${newStatus === 'approved' ? '已批准' : '已拒絕'}？`)) return;
    try {
      await updateDoc(doc(db, 'membership_applications', id), { status: newStatus });
      fetchMembers();
    } catch (error) {
      alert("更新狀態失敗，請檢查權限。");
    }
  };

  // -------------------------
  // 內容 CRUD 功能
  // -------------------------
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (activeTab === 'about') {
        await setDoc(doc(db, 'pages', 'about'), {
          title: currentPost.title || '關於我們',
          intro: currentPost.intro || '',
          committee: currentPost.committee || [],
          updatedAt: new Date()
        });
        alert('關於我們已成功更新！');
      } else {
        const baseData = {
          title: currentPost.title || '',
          date: currentPost.date || new Date().toISOString().split('T')[0],
          content: currentPost.content || '',
          imageUrl: currentPost.imageUrl || '',
          createdAt: currentPost.createdAt || new Date(),
        };

        const postData = activeTab === 'news' 
          ? { ...baseData, youtubeUrl: currentPost.youtubeUrl || '', tags: currentPost.tags || ['校友會動態'] }
          : { ...baseData, status: currentPost.status || 'upcoming', registrationUrl: currentPost.registrationUrl || '', eventDateTime: currentPost.eventDateTime || '', contactInfo: currentPost.contactInfo || '', notificationEmail: currentPost.notificationEmail || '' };

        if (currentPost.id) {
          await updateDoc(doc(db, activeTab, currentPost.id), postData);
        } else {
          await addDoc(collection(db, activeTab), postData);
        }
        setIsEditing(false);
        fetchData();
      }
    } catch (error) {
      console.error("Save error: ", error);
      alert("儲存失敗，請檢查 Firestore 安全規則。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, customCollection?: string) => {
    if (!window.confirm('確定要刪除嗎？此動作無法復原。')) return;
    try {
      await deleteDoc(doc(db, customCollection || activeTab, id));
      if (customCollection === 'membership_applications') fetchMembers();
      else fetchData();
    } catch (error) {
      console.error("Delete error: ", error);
    }
  };

  // 幹事會陣列操作函數
  const handleCommitteeChange = (index: number, field: 'role' | 'name', value: string) => {
    const newCommittee = [...(currentPost.committee || [])];
    newCommittee[index][field] = value;
    setCurrentPost({ ...currentPost, committee: newCommittee });
  };
  const addCommitteeMember = () => {
    setCurrentPost({ ...currentPost, committee: [...(currentPost.committee || []), { role: '', name: '' }] });
  };
  const removeCommitteeMember = (index: number) => {
    const newCommittee = [...(currentPost.committee || [])];
    newCommittee.splice(index, 1);
    setCurrentPost({ ...currentPost, committee: newCommittee });
  };

  // -------------------------
  // 🌟 會員過濾與搜索邏輯 (Client-side)
  // -------------------------
  const filteredMembers = useMemo(() => {
    if (activeTab !== 'members') return [];
    return dataList.filter(member => {
      const matchFilter = memberFilter === 'all' || member.status === memberFilter;
      const searchStr = memberSearch.toLowerCase();
      const matchSearch = 
        (member.name || '').toLowerCase().includes(searchStr) ||
        (member.email || '').toLowerCase().includes(searchStr) ||
        (member.phone || '').includes(searchStr) ||
        (member.studentClass || '').toLowerCase().includes(searchStr) ||
        (member.studentId || '').includes(searchStr);
      return matchFilter && matchSearch;
    });
  }, [dataList, memberFilter, memberSearch, activeTab]);

  // 🌟 發送群發訊息邏輯
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const recipients = filteredMembers.filter(m => m.status === 'approved').map(m => m.email);
    if (recipients.length === 0) {
      alert("目前過濾條件中沒有「已批准」的會員可發送訊息。");
      return;
    }
    
    console.log("Mock Email Sending Triggered:");
    console.log("Recipients:", recipients);
    console.log("Subject:", messageData.subject);
    console.log("Content:", messageData.content);

    // TODO: 未來在此處串接 Firebase Cloud Functions 或 SendGrid API
    alert(`系統提示：成功模擬發送通知至 ${recipients.length} 位會員！\n\n(註：此為前端 UI 模擬。實際寄信需串接後端 API。)`);
    
    setIsMessageModalOpen(false);
    setMessageData({ subject: '', content: '' });
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

      snapshot.docs.forEach((document) => batch.delete(document.ref));

      const sampleEvents = [
        { title: "2026 校友會週年大會 (AGM)", date: "2026-10-01", eventDateTime: "2026-11-15 14:00", content: "誠邀各位會員出席，共商會務發展及票選新一屆幹事。會後將備有茶點招待。\n\n流程：\n1. 會長致辭\n2. 財政報告\n3. 新一屆幹事選舉\n4. 自由交流與茶會", imageUrl: "", status: "upcoming", contactInfo: "陳秘書 9123-4567", notificationEmail: "admin@tkp-dbpp.org.hk", registrationUrl: "", createdAt: new Date() },
        { title: "鄧鏡波盃 舊生籃球邀請賽", date: "2026-10-15", eventDateTime: "2026-12-10 09:00", content: "穿上波衫，重返修院球場！歡迎各屆校友組隊參加，與師兄弟切磋球技，重溫熱血青春。\n\n報名費：每隊 $500\n名額：16 隊 (先到先得)", imageUrl: "", status: "upcoming", contactInfo: "李副會長 9876-5432", notificationEmail: "admin@tkp-dbpp.org.hk", registrationUrl: "", createdAt: new Date() },
        { title: "鮑思高瞻禮感恩祭暨舊生晚宴", date: "2026-11-01", eventDateTime: "2027-01-31 18:00", content: "紀念會祖聖若望·鮑思高，齊聚一堂感念恩師教導。晚宴將設有大抽獎及校友表演環節。\n\n地點：母校大禮堂\n餐券：每位 $300 (大小同價)", imageUrl: "", status: "upcoming", contactInfo: "黃司庫 6123-8888", notificationEmail: "", registrationUrl: "", createdAt: new Date() },
        { title: "2025 校友會新春盆菜宴", date: "2025-01-10", eventDateTime: "2025-02-15 19:00", content: "超過三百名校友及老師聚首母校操場，共享傳統盆菜，氣氛熱鬧，圓滿結束。感謝各位校友的鼎力支持！\n\n當晚除了豐富的盆菜，還有師生才藝表演以及幸運大抽獎，讓大家在歡笑聲中度過了一個難忘的夜晚。", imageUrl: "", status: "past", contactInfo: "", notificationEmail: "", registrationUrl: "", createdAt: new Date() }
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
  // 工具函數 (圖片上傳 & HTML 插入)
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
          if (width > height) { height = Math.round((height *= maxDim / width)); width = maxDim; }
          else { width = Math.round((width *= maxDim / height)); height = maxDim; }
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

  const insertHTML = (tagOpen: string, tagClose: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = currentPost.content || '';
    const selectedText = currentVal.substring(start, end);
    const newVal = currentVal.substring(0, start) + tagOpen + selectedText + tagClose + currentVal.substring(end);
    setCurrentPost({...currentPost, content: newVal});
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length + selectedText.length + tagClose.length, start + tagOpen.length + selectedText.length + tagClose.length);
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
              <input type="email" required defaultValue="admin@tkp-dbpp.org.hk" className="mt-1 block w-full rounded-md border-slate-300 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input type="password" required defaultValue="password123" className="mt-1 block w-full rounded-md border-slate-300 bg-white text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 outline-none" />
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
    <div className="min-h-screen flex bg-slate-50 relative">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* 側邊欄 */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs">TKP</div>
            <span className="font-bold tracking-wider">CMS Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <button onClick={() => {setActiveTab('news'); setIsEditing(false); setIsSidebarOpen(false);}} className={`w-full text-left px-4 py-3 rounded-lg font-semibold ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>新聞動態管理</button>
          <button onClick={() => {setActiveTab('events'); setIsEditing(false); setIsSidebarOpen(false);}} className={`w-full text-left px-4 py-3 rounded-lg font-semibold ${activeTab === 'events' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>活動花絮與報名</button>
          <div className="border-t border-slate-800 my-4"></div>
          <button onClick={() => {setActiveTab('about'); setIsSidebarOpen(false);}} className={`w-full text-left px-4 py-3 rounded-lg font-semibold ${activeTab === 'about' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>單頁：關於我們</button>
          <button onClick={() => {setActiveTab('members'); setIsEditing(false); setIsSidebarOpen(false);}} className={`w-full text-left px-4 py-3 rounded-lg font-semibold ${activeTab === 'members' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>會員申請審批</button>
        </nav>
      </aside>

      {/* 主內容區 */}
      <main className="flex-grow p-4 md:p-8 w-full md:max-w-[calc(100%-16rem)] max-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 md:mb-8 gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="md:hidden p-2 -ml-2 text-slate-800 hover:bg-slate-200 rounded-md focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                {activeTab === 'news' && '新聞動態管理'}
                {activeTab === 'events' && '活動花絮與報名管理'}
                {activeTab === 'about' && '關於我們 - 內容編輯'}
                {activeTab === 'members' && '會員申請審批'}
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {!isEditing && activeTab === 'events' && (
                <button onClick={handleSeedEvents} disabled={isSeeding} className="px-3 py-1.5 text-xs md:text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors">
                  {isSeeding ? '處理中...' : '🧹 重置範例資料'}
                </button>
              )}
              {!isEditing && activeTab !== 'about' && activeTab !== 'members' && (
                <button onClick={() => { setCurrentPost({}); setIsEditing(true); }} className={`text-white px-4 md:px-6 py-2 rounded-lg font-bold shadow-md text-sm md:text-base ${activeTab === 'news' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                  + 新增內容
                </button>
              )}
            </div>
          </header>

          {/* 會員審批列表 (含過濾、搜索與發送訊息) */}
          {activeTab === 'members' ? (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
               
               {/* 過濾、搜索與信息發佈工具列 */}
               <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                 <div className="flex w-full md:w-auto gap-2">
                   <select 
                     value={memberFilter} 
                     onChange={(e) => setMemberFilter(e.target.value)}
                     className="border border-slate-300 rounded-lg p-2 text-sm bg-white outline-none focus:border-amber-500"
                   >
                     <option value="all">全部狀態</option>
                     <option value="pending">待審批 (Pending)</option>
                     <option value="approved">已批准 (Approved)</option>
                     <option value="rejected">已拒絕 (Rejected)</option>
                   </select>
                   <input 
                     type="text" 
                     placeholder="搜尋姓名/Email/電話/學號..." 
                     value={memberSearch}
                     onChange={(e) => setMemberSearch(e.target.value)}
                     className="flex-grow md:w-64 border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-amber-500"
                   />
                 </div>
                 <button 
                   onClick={() => setIsMessageModalOpen(true)}
                   className="w-full md:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
                 >
                   發送群發通知 (Email)
                 </button>
               </div>

               <div className="overflow-x-auto w-full">
                 <table className="w-full text-left text-sm text-slate-600">
                   <thead className="bg-white text-slate-800 font-semibold border-b border-slate-200 whitespace-nowrap">
                     <tr>
                       <th className="p-4">申請人姓名</th>
                       <th className="p-4">聯絡資料</th>
                       <th className="p-4">學籍 (畢業年/班別/學號)</th>
                       <th className="p-4">審批狀態</th>
                       <th className="p-4 text-right">操作</th>
                     </tr>
                   </thead>
                   <tbody>
                     {isLoading ? <tr><td colSpan={5} className="p-8 text-center text-slate-400">載入中...</td></tr> : 
                      filteredMembers.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-400">找不到符合的申請資料</td></tr> : 
                      filteredMembers.map(member => (
                       <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                         <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{member.name}</td>
                         <td className="p-4 whitespace-nowrap">{member.phone}<br/><span className="text-xs text-slate-400">{member.email}</span></td>
                         <td className="p-4">
                           {member.gradYear} 年 <br/>
                           <span className="text-xs text-slate-500">
                             {member.studentClass ? `${member.studentClass}班 ` : ''}{member.studentId ? `學號:${member.studentId}` : ''}
                           </span>
                         </td>
                         <td className="p-4 whitespace-nowrap">
                           {member.status === 'pending' && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-200">待審批</span>}
                           {member.status === 'approved' && <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold border border-emerald-200">已批准</span>}
                           {member.status === 'rejected' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">已拒絕</span>}
                         </td>
                         <td className="p-4 text-right space-x-2 whitespace-nowrap">
                           {member.status === 'pending' && (
                             <>
                              <button onClick={() => updateMemberStatus(member.id, 'approved')} className="text-emerald-600 font-bold hover:underline">批准</button>
                              <button onClick={() => updateMemberStatus(member.id, 'rejected')} className="text-red-500 font-bold hover:underline ml-2">拒絕</button>
                             </>
                           )}
                           <button onClick={() => handleDelete(member.id, 'membership_applications')} className="text-slate-400 hover:text-red-500 hover:underline ml-4">刪除</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          ) : isEditing || activeTab === 'about' ? (
            /* 通用內容編輯表單 */
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg md:text-xl font-bold text-slate-800">{currentPost.id ? '編輯內容' : '新增內容'}</h2>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{activeTab === 'about' ? '網頁大標題' : '標題 (Title) *'}</label>
                  <input type="text" required value={currentPost.title || ''} onChange={e => setCurrentPost({...currentPost, title: e.target.value})} className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                {/* 🌟 關於我們專屬：雙區塊結構化資料表單 */}
                {activeTab === 'about' ? (
                  <div className="space-y-8 border-t border-slate-100 pt-6">
                    <div>
                      <label className="block text-base font-bold text-slate-800 mb-2">1. 介紹文字 (純文字)</label>
                      <p className="text-xs text-slate-500 mb-2">無需輸入 HTML 代碼，直接在此輸入文字，換行會自動反映在網頁上。</p>
                      <textarea 
                        required rows={6} 
                        value={currentPost.intro || ''} 
                        onChange={e => setCurrentPost({...currentPost, intro: e.target.value})} 
                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 text-sm leading-relaxed outline-none" 
                        placeholder="請輸入關於我們的介紹..."
                      />
                    </div>
                    <div>
                      <label className="block text-base font-bold text-slate-800 mb-2">2. 幹事會名單 (Committee)</label>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        {(currentPost.committee || []).map((member: any, index: number) => (
                          <div key={index} className="flex flex-col sm:flex-row gap-3 items-center bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
                            <input 
                              type="text" placeholder="職位 (例: 會長)" required 
                              value={member.role} onChange={e => handleCommitteeChange(index, 'role', e.target.value)} 
                              className="w-full sm:w-1/3 border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                            />
                            <input 
                              type="text" placeholder="姓名 (例: 李小明)" required 
                              value={member.name} onChange={e => handleCommitteeChange(index, 'name', e.target.value)} 
                              className="w-full sm:flex-grow border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                            />
                            <button type="button" onClick={() => removeCommitteeMember(index)} className="w-full sm:w-auto px-3 py-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-md text-sm font-bold">
                              刪除
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={addCommitteeMember} className="mt-3 w-full py-2 border-2 border-dashed border-slate-300 text-slate-600 font-bold rounded-lg hover:border-purple-500 hover:text-purple-600 transition-colors">
                          + 新增幹事會成員
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 一般文章/活動表單 (完整保留) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">建立/發佈日期 *</label>
                        <input type="date" required value={currentPost.date || ''} onChange={e => setCurrentPost({...currentPost, date: e.target.value})} className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">封面圖片 (上傳會自動壓縮)</label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
                          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-200 font-medium whitespace-nowrap">
                            {isUploading ? '壓縮上傳中...' : '選擇圖片上傳'}
                          </button>
                          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                          <input type="url" value={currentPost.imageUrl || ''} onChange={e => setCurrentPost({...currentPost, imageUrl: e.target.value})} placeholder="或直接貼上圖片網址" className="w-full flex-grow border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 outline-none" />
                        </div>
                        {currentPost.imageUrl && (
                          <div className="mt-2 relative w-32 h-32 border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <Image src={currentPost.imageUrl} alt="預覽圖" fill className="object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    {activeTab === 'news' ? (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">YouTube 影片 URL (選填)</label>
                        <input type="url" value={currentPost.youtubeUrl || ''} onChange={e => setCurrentPost({...currentPost, youtubeUrl: e.target.value})} placeholder="https://www.youtube.com/embed/..." className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    ) : (
                      <div className="bg-emerald-50 p-4 md:p-6 rounded-lg border border-emerald-100 space-y-4">
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
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-2">
                        <label className="block text-sm font-semibold text-slate-700">詳細內容 (支援 HTML) *</label>
                        <div className="flex gap-2 flex-wrap">
                          <button type="button" onClick={() => insertHTML('<h3>', '</h3>')} className="text-xs bg-slate-200 text-slate-700 px-2 py-1.5 rounded hover:bg-slate-300 font-bold">H3標題</button>
                          <button type="button" onClick={() => insertHTML('<b>', '</b>')} className="text-xs bg-slate-200 text-slate-700 px-2 py-1.5 rounded hover:bg-slate-300 font-bold">B粗體</button>
                          <button type="button" onClick={() => insertHTML('\n<br/>\n', '')} className="text-xs bg-slate-200 text-slate-700 px-2 py-1.5 rounded hover:bg-slate-300">換行</button>
                          <button type="button" onClick={() => insertHTML('\n<hr className="my-6"/>\n', '')} className="text-xs bg-slate-200 text-slate-700 px-2 py-1.5 rounded hover:bg-slate-300">分隔線</button>
                          <button type="button" onClick={() => insertHTML('<a href="網址" target="_blank" class="text-blue-600 underline">', '</a>')} className="text-xs bg-slate-200 text-slate-700 px-2 py-1.5 rounded hover:bg-slate-300">連結</button>
                        </div>
                      </div>
                      <textarea id="content-editor" required rows={10} value={currentPost.content || ''} onChange={e => setCurrentPost({...currentPost, content: e.target.value})} className="w-full border border-slate-300 bg-white text-slate-900 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none whitespace-pre-wrap font-mono text-sm leading-relaxed" placeholder="在此輸入內容..."></textarea>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  {/* 單頁模式沒有取消按鈕，因為只有一頁可以改 */}
                  {activeTab !== 'about' && <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2.5 text-sm md:text-base text-slate-600 font-bold hover:bg-slate-100 rounded-lg">取消</button>}
                  <button type="submit" disabled={isLoading || isUploading} className={`px-6 py-2.5 text-sm md:text-base text-white font-bold rounded-lg disabled:opacity-50 ${activeTab === 'about' ? 'bg-purple-600 hover:bg-purple-700' : activeTab === 'news' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                    {isLoading ? '儲存中...' : '儲存發佈'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200 whitespace-nowrap">
                    <tr>
                      <th className="p-4 w-28">發佈日期</th>
                      <th className="p-4 min-w-[250px]">標題</th>
                      {activeTab === 'events' && <th className="p-4 w-28">活動狀態</th>}
                      <th className="p-4 min-w-[140px] text-right">操作</th>
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
                            <td className="p-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${post.status === 'upcoming' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {post.status === 'upcoming' ? '即將舉辦' : '圓滿結束'}
                              </span>
                            </td>
                          )}
                          <td className="p-4 text-right space-x-3 whitespace-nowrap">
                            {activeTab === 'events' && (
                              <button onClick={() => fetchRoster(post.id)} className="text-emerald-600 font-semibold hover:underline">名單</button>
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

      {/* 🌟 群發訊息 Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="bg-amber-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">發送群發通知 (Email)</h3>
              <button onClick={() => setIsMessageModalOpen(false)} className="text-amber-100 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4 bg-amber-50 border border-amber-100 p-3 rounded-lg">
                系統將發送 Email 給目前過濾條件中狀態為 <span className="font-bold text-emerald-600">「已批准 (Approved)」</span> 的校友。
                <br/>目前符合條件人數：<span className="font-bold">{filteredMembers.filter(m => m.status === 'approved').length} 人</span>
              </p>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">郵件主旨</label>
                  <input type="text" required value={messageData.subject} onChange={e => setMessageData({...messageData, subject: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-500" placeholder="例如：【校友會通知】週年大會邀請" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">郵件內容</label>
                  <textarea required rows={6} value={messageData.content} onChange={e => setMessageData({...messageData, content: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-500 whitespace-pre-wrap" placeholder="請輸入郵件內文..."></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsMessageModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">取消</button>
                  <button type="submit" className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700">確認發送</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 活動報名名單 Modal (CMS端) */}
      {viewingRosterFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="p-4 md:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <h3 className="text-lg md:text-xl font-bold text-slate-800">報名名單 (共 {rosterList.length} 人)</h3>
              <button onClick={() => setViewingRosterFor(null)} className="text-slate-400 hover:text-slate-600 font-bold text-2xl leading-none">&times;</button>
            </div>
            <div className="p-0 md:p-6 overflow-y-auto">
              {rosterLoading ? (
                <p className="text-center text-slate-500 py-8">載入名單中...</p>
              ) : rosterList.length === 0 ? (
                <p className="text-center text-slate-500 py-8">目前尚無人報名</p>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-100 text-slate-800 whitespace-nowrap">
                      <tr>
                        <th className="p-3 md:rounded-tl-lg">姓名</th>
                        <th className="p-3">電話</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">畢業年</th>
                        <th className="p-3 md:rounded-tr-lg">備註</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rosterList.map(user => (
                        <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">{user.name}</td>
                          <td className="p-3 whitespace-nowrap">{user.phone}</td>
                          <td className="p-3 whitespace-nowrap">{user.email}</td>
                          <td className="p-3">{user.gradYear || '-'}</td>
                          <td className="p-3 min-w-[150px]">{user.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
