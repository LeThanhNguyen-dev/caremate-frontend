import { PlusIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';
import NotificationDropdown from '../NotificationDropdown';
import { useAuth } from '../../hooks/useAuth';

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
    '/nurse/notifications': {
        title: 'Thông báo',
        subtitle: 'Theo dõi các cập nhật mới nhất về lịch hẹn, thanh toán và đánh giá.',
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
        <header className="sticky top-0 z-40 border-b border-slate-50 bg-white/80 px-8 py-6 backdrop-blur-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#10B981] shadow-sm">
                        Kênh điều dưỡng chuyên nghiệp
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">{meta.title}</h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">{meta.subtitle}</p>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationDropdown
                        key={location.pathname}
                        accentClassName="bg-emerald-50 text-[#10B981]"
                        badgeClassName="bg-[#10B981]"
                        buttonClassName="group relative rounded-xl bg-slate-50 p-3 text-slate-400 transition-all hover:bg-emerald-50 hover:text-[#10B981]"
                        emptyIconClassName="text-emerald-100"
                        alignClassName="right-0"
                    />

                    <button className="flex items-center gap-2 rounded-xl bg-[#10B981] px-8 py-3.5 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95">
                        <PlusIcon className="h-4 w-4" />
                        Cài đặt lịch
                    </button>

                    <div className="hidden items-center gap-3 border-l border-slate-100 pl-4 xl:flex">
                        <div className="text-right">
                            <div className="text-xs font-black text-slate-900">{user?.username}</div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-[#10B981]">
                                Vai trò: Điều dưỡng
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NurseHeader;
