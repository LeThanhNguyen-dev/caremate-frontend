import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../contexts/NotificationProvider';
import { BellIcon, InboxStackIcon, PlusIcon } from '@heroicons/react/24/outline';

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
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const meta = pageMeta[location.pathname] ?? {
        title: 'Không gian y tế',
        subtitle: 'Chào mừng bạn quay trở lại với công việc chăm sóc tận tâm.',
    };
    const displayNotifications = notifications.slice(0, 5);

    useEffect(() => {
        setIsNotificationsOpen(false);
    }, [location.pathname]);

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
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsNotificationsOpen((open) => !open)}
                            className="p-3 rounded-lg bg-slate-50 text-slate-400 hover:text-[#10B981] hover:bg-emerald-50 transition-all relative group"
                            aria-label="Mở thông báo"
                        >
                            <BellIcon className="h-6 w-6 transition-transform group-hover:rotate-12" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#10B981] text-white text-[10px] font-black flex items-center justify-center ring-4 ring-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-4 w-[380px] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-100 bg-white p-5 shadow-2xl shadow-slate-900/10">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">Thông báo</h2>
                                        <p className="mt-1 text-xs font-bold text-slate-400">{unreadCount} thông báo chưa đọc</p>
                                    </div>
                                    <Link
                                        to="/nurse/notifications"
                                        className="text-[10px] font-black uppercase tracking-widest text-[#10B981] hover:underline"
                                    >
                                        Xem tất cả
                                    </Link>
                                </div>

                                <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                                    {displayNotifications.length > 0 ? (
                                        displayNotifications.map((notification) => (
                                            <button
                                                key={notification.id}
                                                type="button"
                                                onClick={() => void markAsRead(notification.id)}
                                                className={`w-full rounded-lg p-4 text-left transition-all ${
                                                    notification.isRead ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/70 hover:bg-emerald-50'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-black text-slate-900">{notification.title}</p>
                                                        <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">{notification.content}</p>
                                                        <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-300">
                                                            {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                                        </p>
                                                    </div>
                                                    {!notification.isRead && <span className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-[#10B981]" />}
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="py-10 text-center">
                                            <InboxStackIcon className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                                            <p className="text-xs font-bold text-slate-400">Chưa có thông báo nào.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

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
