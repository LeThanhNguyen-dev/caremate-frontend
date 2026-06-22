import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BellIcon,
    CheckBadgeIcon,
    InboxStackIcon,
    EnvelopeOpenIcon,
    SparklesIcon,
    CheckCircleIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import type { Notification } from '../types/notification';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';

const NotificationsPage = () => {
    const { t } = useTranslation();
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotifications();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredItems = useMemo(() => {
        if (filter === 'unread') {
            return notifications.filter((n: Notification) => !n.isRead);
        }
        return notifications;
    }, [notifications, filter]);

    return (
        <div className="bg-[#FAFAFA] min-h-screen py-24">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
                <div className="relative mb-16">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand/5 blur-[120px] rounded-full pointer-events-none"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-deep/5 blur-[120px] rounded-full pointer-events-none"></div>

                    <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="accent-label !mb-6 shadow-sm">
                                <SparklesIcon className="h-3 w-3" />
                                {t('notificationsPage.system')}
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
                                {t('notificationsPage.center')} <span className="text-brand">{t('notificationsPage.notification')}</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-lg">
                                {t('notificationsPage.youHave')} <span className="text-brand font-black">{unreadCount}</span> {t('notificationsPage.unreadNotifications')}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => void markAllAsRead()}
                                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-brand hover:text-brand transition-all shadow-sm active:scale-95"
                            >
                                <CheckCircleIcon className="h-4 w-4" />
                                {t('notificationsPage.markAllAsRead')}
                            </button>
                            <button
                                onClick={() => void deleteAllNotifications()}
                                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border-2 border-slate-100 text-[10px] font-black uppercase tracking-widest text-red-500 hover:border-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-95"
                            >
                                <TrashIcon className="h-4 w-4" />
                                {t('notificationsPage.deleteAll')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex p-1.5 bg-white rounded-xl border-2 border-slate-50 shadow-sm mb-10 w-fit">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                            filter === 'all'
                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {t('notificationsPage.allNotifications')}
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                            filter === 'unread'
                                ? 'bg-brand text-white shadow-xl shadow-pink-500/20'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {t('notificationsPage.unread', { count: unreadCount })}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {filteredItems.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl p-24 text-center border-2 border-slate-50 shadow-xl shadow-slate-200/20"
                        >
                            <div className="h-32 w-32 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-10">
                                <InboxStackIcon className="h-14 w-14 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{t('notificationsPage.emptyTitle')}</h3>
                            <p className="text-slate-400 text-lg font-medium max-w-sm mx-auto">
                                {t('notificationsPage.emptyDesc')}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid gap-6"
                        >
                            {filteredItems.map((n: Notification, idx: number) => (
                                <motion.div
                                    key={n.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`group relative overflow-hidden bg-white rounded-xl p-8 border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 ${
                                        !n.isRead ? 'border-brand/10 bg-gradient-to-br from-brand/5 to-white' : 'border-slate-50'
                                    }`}
                                >
                                    <div className="relative z-10 flex items-start justify-between gap-8">
                                        <div className="flex gap-8">
                                            <div
                                                className={`h-16 w-16 rounded-xl flex items-center justify-center flex-none shadow-sm transition-all duration-500 group-hover:scale-110 ${
                                                    !n.isRead
                                                        ? 'bg-brand text-white shadow-pink-500/30 rotate-3 group-hover:rotate-0'
                                                        : 'bg-slate-50 text-slate-400'
                                                }`}
                                            >
                                                {!n.isRead ? <BellIcon className="h-8 w-8" /> : <EnvelopeOpenIcon className="h-7 w-7" />}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <h3 className={`text-xl font-black tracking-tight ${!n.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                                                        {n.title}
                                                    </h3>
                                                    {!n.isRead && (
                                                        <span className="flex h-3 w-3 rounded-full bg-brand relative">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-base font-medium text-slate-500 leading-relaxed mb-6 max-w-2xl">
                                                    {n.content}
                                                </p>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                                        {new Date(n.createdAt).toLocaleString('vi-VN')}
                                                    </div>
                                                    <div className={`h-1.5 w-1.5 rounded-full ${!n.isRead ? 'bg-brand/20' : 'bg-slate-100'}`}></div>
                                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                                        #{n.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {!n.isRead && (
                                                <button
                                                    onClick={() => void markAsRead(n.id)}
                                                    className="h-14 w-14 rounded-xl bg-white border-2 border-slate-50 text-brand hover:bg-brand hover:text-white hover:border-brand transition-all duration-300 shadow-sm flex items-center justify-center group/btn"
                                                    title={t('notificationsPage.markAsRead')}
                                                >
                                                    <CheckBadgeIcon className="h-7 w-7 transition-transform group-hover/btn:scale-110" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => void deleteNotification(n.id)}
                                                className="h-14 w-14 rounded-xl bg-white border-2 border-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all duration-300 shadow-sm flex items-center justify-center group/btn"
                                                title={t('notificationsPage.delete')}
                                            >
                                                <TrashIcon className="h-6 w-6 transition-transform group-hover/btn:scale-110" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
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
