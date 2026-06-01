import { Link } from 'react-router-dom';
import { ChartBarSquareIcon, HeartIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

const HealthCheckInsEntryPage = () => {
  return (
    <div className="group relative overflow-hidden rounded-[1.35rem] border border-teal-100 bg-white p-[1px] shadow-[0_22px_60px_rgba(15,118,110,0.12)]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(255,255,255,1)_46%,rgba(240,249,255,0.9))]" />

      <div className="relative flex flex-col gap-5 rounded-[1.35rem] px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-teal-200 transition group-hover:scale-105">
            <SparklesIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <div className="mb-2 inline-flex rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-700 ring-1 ring-teal-100">
              AI clinical triage
            </div>
            <h3 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">Trung tâm phân tích sức khỏe mẹ và bé</h3>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Chấm điểm rủi ro, đọc xu hướng 7 lần gần nhất, ưu tiên dấu hiệu cần theo dõi và đề xuất kế hoạch chăm sóc tiếp theo ngay trong CareMate.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-100">
                <ShieldCheckIcon className="h-4 w-4 text-teal-600" />
                Risk score
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-100">
                <ChartBarSquareIcon className="h-4 w-4 text-teal-600" />
                Trend insight
              </span>
            </div>
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
