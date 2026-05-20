import { Link } from 'react-router-dom';
import { HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';

const HealthCheckInsEntryPage = () => {
  return (
    <div className="rounded-xl border border-teal-100 bg-[linear-gradient(135deg,rgba(240,253,250,1),rgba(255,255,255,1))] p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
            <SparklesIcon className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Phân tích Check-in Sức khỏe bằng AI</h3>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Theo dõi tình trạng mẹ và bé mỗi ngày, nhận cảnh báo sớm và gợi ý dịch vụ phù hợp ngay trong CareMate.
            </p>
          </div>
        </div>
        <Link
          to="/health-checkins"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-teal-700"
        >
          <HeartIcon className="h-5 w-5" />
          Mở check-in ngay
        </Link>
      </div>
    </div>
  );
};

export default HealthCheckInsEntryPage;
