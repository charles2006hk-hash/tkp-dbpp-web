'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function MembershipPage() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', gradYear: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'membership_applications'), {
        ...formData,
        status: 'pending', // 預設狀態為待審批
        createdAt: new Date()
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Submit error:", error);
      alert("提交失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow py-16 px-4 md:px-8 max-w-3xl mx-auto w-full">
        <header className="mb-12 text-center">
          <div className="flex justify-center mb-6"><Image src="/logo.png" alt="Logo" width={64} height={64} /></div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-blue-900 mb-4">加入會員</h1>
          <p className="text-slate-600 text-lg">傳承鮑思高精神，凝聚舊生力量</p>
        </header>

        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-200">
          {isSuccess ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">申請已送出！</h2>
              <p className="text-slate-600">感謝您的申請。管理委員會將會審核您的資料，並透過 Email 或電話與您聯繫後續事宜。</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">中/英文姓名 *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">聯絡電話 *</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">畢業年份 *</label>
                  <input type="text" required placeholder="例: 2006" value={formData.gradYear} onChange={e => setFormData({...formData, gradYear: e.target.value})} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">通訊地址 (選填)</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="pt-6">
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md">
                  {isSubmitting ? '資料傳送中...' : '送出會員申請表'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
