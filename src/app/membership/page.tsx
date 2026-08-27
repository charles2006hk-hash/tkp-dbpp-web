import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MembershipPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow py-16 px-4 md:px-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-6 tracking-tight">加入會員</h1>
          <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full mb-8"></div>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed">
            無論你畢業多久，母校的大門永遠為你敞開。<br />
            加入同學會，獲取最新校友資訊、參與專屬活動，並將鮑思高精神傳承給下一代波記學子。
          </p>
          
          <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-xl max-w-2xl mx-auto text-left">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">入會須知</h3>
            <ul className="space-y-4 text-slate-600 mb-8 list-disc list-inside">
              <li>申請人必須為鄧鏡波學校之歷屆畢業生或曾就讀之學生。</li>
              <li>入會需填妥申請表並繳交一次性永久會員費。</li>
              <li>會員可享有參與校友會舉辦之各項活動及享有專屬福利。</li>
            </ul>
            
            <div className="flex justify-center mt-8">
              <button className="px-8 py-4 bg-blue-900 text-white font-bold rounded-full hover:bg-blue-800 shadow-lg transition-transform hover:-translate-y-1">
                下載入會申請表 (PDF)
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
