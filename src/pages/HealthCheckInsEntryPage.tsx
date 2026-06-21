import { Link } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/outline';

const HealthCheckInsEntryPage = () => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-teal-100 bg-white p-[1px] shadow-[0_22px_60px_rgba(15,118,110,0.12)]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(255,255,255,1)_46%,rgba(240,249,255,0.9))]" />

      <div className="relative flex flex-col gap-5 rounded-2xl px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-teal-200 transition group-hover:scale-105">
            <SparklesIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">Phân tích tình trạng sức khỏe để đưa ra gói chăm sóc phù hợp</h3>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Ưu tiên dấu hiệu cần theo dõi và đề xuất kế hoạch chăm sóc tiếp theo ngay trong CareMate.
            </p>
          </div>
        </div>

        <Link
          to="/health-checkins"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-teal-200"
        >
          <SparklesIcon className="h-5 w-5" />
          Gợi ý dịch vụ phù hợp
        </Link>
      </div>
    </div>
  );
};

export default HealthCheckInsEntryPage;
