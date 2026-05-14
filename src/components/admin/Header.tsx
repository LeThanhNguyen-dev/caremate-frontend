import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../contexts/NotificationProvider';
import { BellIcon, InboxStackIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AdminHeader = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    useEffect(() => {
        setIsNotificationsOpen(false);
    }, [location.pathname]);

    const getPageTitle = (path: string) => {
        switch (path) {
            case '/admin/dashboard': return 'Tổng quan hệ thống';
            case '/admin/pending-nurses': return 'Phê duyệt hồ sơ';
            case '/admin/users': return 'Quản lý người dùng';
            case '/admin/bookings': return 'Quản lý lịch hẹn';
            case '/admin/reports': return 'Báo cáo & Khiếu nại';
            case '/admin/settings': return 'Cài đặt hệ thống';
            case '/admin/notifications': return 'Thông báo';
            default: return 'Quản trị viên';
        }
    };

    const displayNotifications = notifications.slice(0, 5);

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl px-8 py-6 border-b border-slate-50">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#3B82F6] text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                        Bảng điều khiển quản trị viên
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{getPageTitle(location.pathname)}</h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">Giám sát và điều phối toàn bộ hoạt động của nền tảng CareMate.</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center relative group">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 text-slate-400 group-focus-within:text-[#3B82F6] transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng, đơn hàng..."
                            className="bg-slate-50 border-none rounded-lg py-3 pl-12 pr-6 text-sm font-medium w-80 focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsNotificationsOpen((open) => !open)}
                                className="p-3 rounded-lg bg-slate-50 text-slate-400 hover:text-[#3B82F6] hover:bg-blue-50 transition-all relative group"
                                aria-label="Mở thông báo"
                            >
                                <BellIcon className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#3B82F6] text-white text-[10px] font-black flex items-center justify-center ring-4 ring-white">
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
                                            to="/admin/notifications"
                                            className="text-[10px] font-black uppercase tracking-widest text-[#3B82F6] hover:underline"
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
                                                        notification.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/70 hover:bg-blue-50'
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
                                                        {!notification.isRead && <span className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-[#3B82F6]" />}
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

                        <div className="h-10 w-[1px] bg-slate-100 mx-2"></div>

                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-black text-slate-900 uppercase">{user?.username || 'Admin'}</div>
                            <div className="text-[9px] font-bold text-[#3B82F6] uppercase tracking-[0.3em]">Administrator</div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
