import { Link } from 'react-router-dom';
import { HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';

const HealthCheckInsEntryPage = () => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-teal-100 bg-white p-[1px] shadow-[0_18px_45px_rgba(15,118,110,0.10)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_20%,rgba(20,184,166,0.18),transparent_28%),linear-gradient(135deg,rgba(240,253,250,0.95),rgba(255,255,255,1)_48%,rgba(236,253,245,0.9))]" />

      <div className="relative flex flex-col gap-5 rounded-2xl px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-200 transition group-hover:scale-105">
            <SparklesIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <div className="mb-2 inline-flex rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-700 ring-1 ring-teal-100">
              Trợ lý sức khỏe
            </div>
            <h3 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">Phân tích Check-in Sức khỏe bằng AI</h3>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Theo dõi tình trạng mẹ và bé mỗi ngày, nhận cảnh báo sớm, xu hướng 7 lần gần nhất và gợi ý dịch vụ phù hợp ngay trong CareMate.
            </p>
          </div>
        </div>

        <Link
          to="/health-checkins"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-teal-200"
        >
          <HeartIcon className="h-5 w-5" />
          Mở check-in ngay
        </Link>
      </div>
    </div>
  );
};

export default HealthCheckInsEntryPage;
