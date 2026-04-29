import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BellIcon, 
    CheckBadgeIcon, 
     
    InboxStackIcon,
    EnvelopeOpenIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';
import caremateApi from '../api/caremateApi';
import type { Notification } from '../api/frontend-api-contract';

const NotificationsPage = () => {
    const { showToast } = useToast();
    const [items, setItems] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await caremateApi.getNotifications();
            setItems(data);
        } catch {
            showToast('Không thể tải danh sách thông báo.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const markRead = async (id: number) => {
        try {
            await caremateApi.markNotificationRead(id);
            setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch {
            showToast('Lỗi khi đánh dấu thông báo.', 'error');
        }
    };

    const filteredItems = useMemo(() => {
        if (filter === 'unread') return items.filter(n => !n.isRead);
        return items;
    }, [items, filter]);

    const unreadCount = items.filter(n => !n.isRead).length;

    if (loading) return (
        <div className="flex min-h-[60vh] items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-6">
                <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-brand border-t-transparent"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang đồng bộ thông báo...</span>
            </div>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen py-20">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="bg-slate-900 rounded-[40px] p-12 mb-12 relative overflow-hidden text-center lg:text-left">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="accent-label !bg-white/10 !text-white border-white/20">Trung tâm tin nhắn</div>
                            <h1 className="text-4xl font-black text-white mb-4">Thông báo của bạn</h1>
                            <p className="text-white/50 text-sm font-medium">Bạn có {unreadCount} thông báo mới chưa đọc.</p>
                        </div>
                        <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10">
                            <button 
                                onClick={() => setFilter('all')}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filter === 'all' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/40 hover:text-white'
                                }`}
                            >
                                Tất cả
                            </button>
                            <button 
                                onClick={() => setFilter('unread')}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filter === 'unread' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/40 hover:text-white'
                                }`}
                            >
                                Chưa đọc ({unreadCount})
                            </button>
                        </div>
                    </div>
                </div>

                {/* List */}
                <AnimatePresence mode="wait">
                    {filteredItems.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[40px] p-24 text-center border border-slate-100 shadow-xl shadow-slate-200/20"
                        >
                            <div className="h-24 w-24 rounded-[32px] bg-slate-50 flex items-center justify-center mx-auto mb-8">
                                <InboxStackIcon className="h-10 w-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Hộp thư trống</h3>
                            <p className="text-slate-400 text-sm font-medium">Bạn chưa nhận được thông báo nào mới.</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            {filteredItems.map((n, idx) => (
                                <motion.div 
                                    key={n.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`bg-white rounded-[32px] p-8 border-2 transition-all flex items-start justify-between gap-6 hover:shadow-xl hover:shadow-slate-200/50 ${
                                        !n.isRead ? 'border-brand/10 bg-brand/5 shadow-brand/5' : 'border-slate-50'
                                    }`}
                                >
                                    <div className="flex gap-6">
                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-none shadow-sm ${
                                            !n.isRead ? 'bg-brand text-white shadow-brand/20' : 'bg-slate-50 text-slate-400'
                                        }`}>
                                            {!n.isRead ? <BellIcon className="h-6 w-6" /> : <EnvelopeOpenIcon className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className={`text-lg font-black ${!n.isRead ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</h3>
                                                {!n.isRead && <span className="h-2 w-2 rounded-full bg-brand"></span>}
                                            </div>
                                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-4 max-w-2xl">{n.content}</p>
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(n.createdAt).toLocaleString('vi-VN')}</div>
                                        </div>
                                    </div>
                                    {!n.isRead && (
                                        <button 
                                            onClick={() => markRead(n.id)}
                                            className="p-3 rounded-xl bg-white text-brand hover:bg-brand hover:text-white border border-brand/10 transition-all shadow-sm"
                                        >
                                            <CheckBadgeIcon className="h-6 w-6" />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NotificationsPage;

