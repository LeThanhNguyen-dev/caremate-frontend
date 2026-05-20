import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon, PlayIcon } from '@heroicons/react/24/solid';
import caremateApi from '../api/caremateApi';
import type { PackageProgressDto } from '../api/frontend-api-contract';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

type Props = {
    bookingId: number;
    packageDays: number;
    bookingStatus?: string;
    onProgressChanged?: () => void;
};

const PackageProgressTracker: React.FC<Props> = ({ bookingId, bookingStatus, onProgressChanged }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [progress, setProgress] = useState<PackageProgressDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [nurseNote, setNurseNote] = useState('');

    const fetchProgress = async () => {
        try {
            const data = await caremateApi.getPackageProgress(bookingId);
            setProgress(data);
        } catch (err) {
            console.error('Failed to load package progress', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchProgress();
    }, [bookingId]);

    const handleCheckIn = async () => {
        try {
            setActionLoading(true);
            await caremateApi.checkInSession(bookingId, { nurseNote: nurseNote || undefined });
            setNurseNote('');
            await fetchProgress();
            onProgressChanged?.();
            showToast('Đã check-in buổi chăm sóc hôm nay.', 'success');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            showToast(error.response?.data?.message || 'Không thể check-in buổi chăm sóc.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setActionLoading(true);
            await caremateApi.checkOutSession(bookingId, { nurseNote: nurseNote || undefined });
            setNurseNote('');
            await fetchProgress();
            onProgressChanged?.();
            showToast('Đã check-out và đánh dấu hoàn thành buổi hôm nay.', 'success');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            showToast(error.response?.data?.message || 'Không thể check-out buổi chăm sóc.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="text-sm text-slate-400 p-8 text-center animate-pulse">Đang tải tiến độ...</div>;
    if (!progress || progress.sessions.length === 0) return null;

    const isNurse = user?.role === 'nurse_confirmed';
    const todaySession = progress.todaySession;
    const canCheckIn = isNurse && todaySession?.status === 'pending' && bookingStatus !== 'completed';
    const canCheckOut = isNurse && todaySession?.status === 'checked_in' && bookingStatus !== 'completed';
    const showNurseAction = isNurse && bookingStatus !== 'completed';

    return (
        <div className="mt-12 bg-white rounded-xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.06)] border border-slate-50">
            <div className="bg-slate-900 p-8 text-white">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black tracking-tight">Tiến độ gói dịch vụ</h3>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 px-4 py-2 rounded-full">
                        Hoàn thành {progress.completedSessions}/{progress.totalSessions} buổi
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-brand to-pink-400 rounded-full"
                    />
                </div>
                <div className="text-right mt-2 text-[10px] font-black text-white/50 tracking-widest">{progress.progressPercent}%</div>
            </div>

            {showNurseAction && (
                <div className="border-b border-slate-100 bg-slate-50/70 p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-brand">
                                Điểm danh buổi chăm sóc
                            </div>
                            <h4 className="mt-2 text-xl font-black text-slate-900">
                                {todaySession
                                    ? `Hôm nay: ${todaySession.title || `Buổi ${todaySession.sessionNumber}`}`
                                    : 'Hôm nay không có buổi trong lộ trình'}
                            </h4>
                            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                                {todaySession
                                    ? 'Y tá check-in khi bắt đầu chăm sóc và check-out khi hoàn tất. Ghi chú sẽ được lưu vào tiến độ gói để khách hàng theo dõi.'
                                    : 'Chỉ có thể check-in/check-out đúng ngày đã được sinh trong lộ trình gói dịch vụ.'}
                            </p>
                        </div>

                        {todaySession && (
                            <div className="w-full lg:w-[360px]">
                                <textarea
                                    value={nurseNote}
                                    onChange={(event) => setNurseNote(event.target.value)}
                                    rows={3}
                                    placeholder="Ghi chú chuyên môn cho buổi hôm nay..."
                                    className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                                />
                                <div className="mt-3 flex gap-3">
                                    {canCheckIn && (
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => void handleCheckIn()}
                                            className="flex-1 rounded-xl bg-brand px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Đang lưu...' : 'Check-in'}
                                        </button>
                                    )}
                                    {canCheckOut && (
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => void handleCheckOut()}
                                            className="flex-1 rounded-xl bg-emerald-600 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-600/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Đang lưu...' : 'Check-out hoàn thành'}
                                        </button>
                                    )}
                                    {!canCheckIn && !canCheckOut && (
                                        <div className="flex-1 rounded-xl bg-white px-5 py-3 text-center text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                            {todaySession.status === 'completed' ? 'Buổi hôm nay đã hoàn thành' : 'Chưa thể thao tác'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="p-8">
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-slate-100 rounded-full"></div>

                    <div className="space-y-8 relative">
                        {progress.sessions.map((session, index) => {
                            const isCompleted = session.status === 'completed';
                            const isCurrent = session.status === 'checked_in' || (!isCompleted && index === progress.completedSessions);
                            const isPending = session.status === 'pending' && !isCurrent;

                            return (
                                <div key={session.id} className="flex gap-6 group">
                                    <div className="relative z-10 flex-shrink-0">
                                        <div className={`w-14 h-14 rounded-full border-4 border-white flex items-center justify-center shadow-md transition-all ${
                                            isCompleted ? 'bg-green-500 text-white shadow-green-500/20' : 
                                            isCurrent ? 'bg-brand text-white shadow-brand/30 animate-pulse' : 
                                            'bg-slate-100 text-slate-300'
                                        }`}>
                                            {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : 
                                             isCurrent ? <PlayIcon className="w-6 h-6 ml-1" /> : 
                                             <ClockIcon className="w-6 h-6" />}
                                        </div>
                                    </div>
                                    <div className={`flex-1 pt-2 pb-6 border-b border-slate-50 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                                                    Buổi {session.sessionNumber} • {new Date(session.sessionDate).toLocaleDateString('vi-VN')}
                                                </div>
                                                <h4 className={`text-lg font-black tracking-tight ${isCurrent ? 'text-brand' : 'text-slate-900'}`}>
                                                    {session.title || `Chăm sóc ngày ${session.sessionNumber}`}
                                                </h4>
                                            </div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                                isCompleted ? 'bg-green-50 text-green-600' :
                                                isCurrent ? 'bg-brand/10 text-brand' :
                                                'bg-slate-50 text-slate-400'
                                            }`}>
                                                {isCompleted ? 'Đã xong' : isCurrent ? 'Đang thực hiện' : 'Chờ thực hiện'}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            {session.description || 'Thực hiện các dịch vụ trong liệu trình gói.'}
                                        </p>

                                        {(session.checkInTime || session.checkOutTime) && (
                                            <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                {session.checkInTime && <div>Check-in: <span className="text-slate-600">{new Date(session.checkInTime).toLocaleTimeString('vi-VN')}</span></div>}
                                                {session.checkOutTime && <div>Check-out: <span className="text-slate-600">{new Date(session.checkOutTime).toLocaleTimeString('vi-VN')}</span></div>}
                                            </div>
                                        )}
                                        {session.nurseNote && (
                                            <div className="mt-3 text-sm italic text-slate-500 bg-yellow-50/50 p-3 rounded-xl border border-yellow-100/50">
                                                <span className="font-semibold not-italic text-yellow-700 mr-2">Ghi chú y tá:</span>
                                                {session.nurseNote}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageProgressTracker;
