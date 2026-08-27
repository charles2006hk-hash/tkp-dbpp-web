import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h3 className="text-3xl font-extrabold text-blue-900 mb-6 relative inline-block">
              母校與鮑思高精神
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
            </h3>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              「教育是一件內心的事情。」 作為慈幼會創辦人聖若望·鮑思高（St. John Bosco）畢生致力於青少年的教育與關懷。他提倡的「預防教育法」——以理智、宗教、仁愛為核心，深深影響了鄧鏡波學校的辦學理念。
            </p>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              本會冠以「鮑思高」之名，旨在提醒所有畢業校友，無論身處社會何方，皆應秉持母校教誨，關愛弱勢，熱心服務。
            </p>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-2xl font-bold text-slate-800 mb-4">本屆幹事會 (Committee)</h4>
            <ul className="space-y-4 text-slate-700">
              <li className="flex justify-between border-b border-slate-200 pb-2"><span className="font-semibold">會長</span><span>李小明</span></li>
              <li className="flex justify-between border-b border-slate-200 pb-2"><span className="font-semibold">副會長</span><span>張大志</span></li>
              <li className="flex justify-between border-b border-slate-200 pb-2"><span className="font-semibold">秘書長</span><span>陳建國</span></li>
              <li className="flex justify-between pt-2"><span className="font-semibold">司庫</span><span>黃家輝</span></li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
