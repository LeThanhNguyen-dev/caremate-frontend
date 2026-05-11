import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BellIcon, PlusIcon } from '@heroicons/react/24/outline';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
    '/nurse/overview': {
        title: 'Bảng điều khiển',
        subtitle: 'Theo dõi tổng quan công việc và hiệu suất chăm sóc của bạn.',
    },
    '/nurse/schedule': {
        title: 'Lịch làm việc',
        subtitle: 'Quản lý thời gian biểu và các khung giờ phục vụ khách hàng.',
    },
    '/nurse/bookings': {
        title: 'Quản lý lịch hẹn',
        subtitle: 'Xử lý các yêu cầu đặt lịch và theo dõi tiến độ công việc.',
    },
    '/nurse/services': {
        title: 'Dịch vụ của tôi',
        subtitle: 'Tùy chỉnh danh mục dịch vụ và mức giá chuyên môn của bạn.',
    },
    '/nurse/profile': {
        title: 'Hồ sơ chuyên môn',
        subtitle: 'Cập nhật thông tin cá nhân và chứng chỉ hành nghề.',
    },
};

const NurseHeader = () => {
    const location = useLocation();
    const { user } = useAuth();
    const meta = pageMeta[location.pathname] ?? {
        title: 'Không gian y tế',
        subtitle: 'Chào mừng bạn quay trở lại với công việc chăm sóc tận tâm.',
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl px-8 py-6 border-b border-slate-50">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-[#10B981] text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                        Kênh điều dưỡng chuyên nghiệp
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{meta.title}</h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">{meta.subtitle}</p>
                </div>

                <div className="flex items-center gap-4">
                    <Link 
                        to="/notifications" 
                        className="p-3 rounded-lg bg-slate-50 text-slate-400 hover:text-[#10B981] hover:bg-emerald-50 transition-all relative group"
                    >
                        <BellIcon className="h-6 w-6 transition-transform group-hover:rotate-12" />
                        <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-[#10B981] ring-4 ring-white"></span>
                    </Link>

                    <button className="bg-[#10B981] text-white px-8 py-3.5 rounded-lg font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 flex items-center gap-2 hover:scale-[1.02] transition-all active:scale-95">
                        <PlusIcon className="h-4 w-4" />
                        Cài đặt lịch
                    </button>

                    <div className="hidden xl:flex items-center gap-3 pl-4 border-l border-slate-100">
                        <div className="text-right">
                            <div className="text-xs font-black text-slate-900">{user?.username}</div>
                            <div className="text-[9px] font-bold text-[#10B981] uppercase tracking-widest">Vai trò: Điều dưỡng</div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NurseHeader;
