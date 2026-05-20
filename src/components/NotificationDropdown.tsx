import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BellIcon,
    CheckCircleIcon,
    InboxStackIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { useNotifications } from '../hooks/useNotifications';

type NotificationDropdownProps = {
    accentClassName: string;
    badgeClassName: string;
    panelWidthClassName?: string;
    emptyIconClassName?: string;
    buttonClassName?: string;
    alignClassName?: string;
};

const NotificationDropdown = ({
    accentClassName,
    badgeClassName,
    panelWidthClassName = 'w-[420px]',
    emptyIconClassName = 'text-slate-100',
    buttonClassName = 'p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all relative group',
    alignClassName = 'right-0',
}: NotificationDropdownProps) => {
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotifications();

    const displayNotifications = notifications.slice(0, 6);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleOutsideClick = (event: MouseEvent) => {
            if (!dropdownRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [open]);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={buttonClassName}
                aria-expanded={open}
                aria-label="Mở thông báo"
            >
                <BellIcon className="h-6 w-6 transition-transform group-hover:rotate-12" />
                {unreadCount > 0 && (
                    <span className={`absolute top-2.5 right-2.5 h-3 w-3 rounded-full ring-4 ring-white ${badgeClassName}`}></span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className={`absolute ${alignClassName} mt-4 ${panelWidthClassName} rounded-xl border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-900/10 z-[140]`}
                    >
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Thông báo</h4>
                                <p className="mt-1 text-xs font-bold text-slate-400">Cập nhật mới từ hệ thống và cuộc hẹn của bạn</p>
                            </div>
                            <span className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest ${accentClassName}`}>
                                {unreadCount} mới
                            </span>
                        </div>

                        {displayNotifications.length > 0 ? (
                            <>
                                <div className="mb-5 max-h-[360px] space-y-3 overflow-y-auto custom-scrollbar pr-1">
                                    {displayNotifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`rounded-xl border p-4 transition-all ${
                                                notif.isRead
                                                    ? 'border-slate-100 bg-slate-50/40'
                                                    : `${accentClassName} border-transparent`
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => void markAsRead(notif.id)}
                                                    className="min-w-0 flex-1 text-left"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`line-clamp-1 text-sm font-black ${notif.isRead ? 'text-slate-800' : 'text-slate-900'}`}>
                                                            {notif.title}
                                                        </span>
                                                        {!notif.isRead && <span className={`h-2 w-2 rounded-full ${badgeClassName}`}></span>}
                                                    </div>
                                                    <div className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">
                                                        {notif.content}
                                                    </div>
                                                    <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-300">
                                                        {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => void deleteNotification(notif.id)}
                                                    className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-slate-300 transition-all hover:bg-red-50 hover:text-red-500"
                                                    title="Xóa thông báo"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => void markAllAsRead()}
                                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:border-slate-200 hover:bg-white"
                                    >
                                        <CheckCircleIcon className="h-4 w-4" />
                                        Đọc tất cả
                                    </button>
                                    <Link
                                        to="/notifications"
                                        className="flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:opacity-90"
                                    >
                                        Xem chi tiết
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-100 px-6 py-12 text-center">
                                <InboxStackIcon className={`mx-auto mb-4 h-10 w-10 ${emptyIconClassName}`} />
                                <p className="text-sm font-black text-slate-800">Chưa có thông báo mới</p>
                                <p className="mt-2 text-xs font-medium text-slate-400">Các cập nhật mới sẽ xuất hiện ngay tại đây.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
