'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RegistrationModalProps {
  eventId: string;
  eventTitle: string;
}

export default function RegistrationModal({ eventId, eventTitle }: RegistrationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gradYear: '',
    remarks: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'event_registrations'), {
        eventId,
        eventTitle, // 冗餘儲存方便後台直觀查看
        ...formData,
        createdAt: new Date()
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Registration error:", error);
      alert("報名失敗，請稍後再試或聯繫管理員。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-block bg-blue-600 text-white font-bold text-lg rounded-full px-12 py-4 shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        立即線上報名 &rarr;
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="bg-blue-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">活動報名</h3>
                <p className="text-blue-200 text-sm mt-1 line-clamp-1">{eventTitle}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6 md:p-8">
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">✓</div>
                  <h4 className="text-2xl font-bold text-slate-800 mb-2">報名成功！</h4>
                  <p className="text-slate-600 mb-8">感謝您的參與，我們已收到您的報名資料。</p>
                  <button onClick={() => setIsOpen(false)} className="bg-slate-100 text-slate-700 font-bold py-2 px-6 rounded-lg hover:bg-slate-200">關閉視窗</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">姓名 (Name) *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">聯絡電話 (Phone) *</label>
                      <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">畢業年份 (Grad Year)</label>
                      <input type="text" placeholder="例: 2006" value={formData.gradYear} onChange={e => setFormData({...formData, gradYear: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">備註 (Remarks)</label>
                    <textarea rows={3} value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} placeholder="同行人數、飲食偏好等..." className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">取消</button>
                    <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md">
                      {isSubmitting ? '送出中...' : '確認報名'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
