import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon, PlayIcon, StarIcon } from '@heroicons/react/24/solid';
import caremateApi from '../api/caremateApi';
import type { PackageProgressDto } from '../api/frontend-api-contract';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

type Props = {
    bookingId: number;
    packageDays: number;
    bookingStatus?: string;
    finalReviewRating?: number | null;
    finalReviewComment?: string | null;
    finalReviewCreatedAt?: string | null;
    onProgressChanged?: () => void;
};

const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa có';

const formatTime = (value?: string | null) =>
    value ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa có';

const formatDuration = (start?: string | null, end?: string | null) => {
    if (!start || !end) return 'Chưa có';
    const minutes = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours <= 0) return `${mins} phút`;
    return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
};

const resolveSessionStatus = (session: PackageProgressDto['sessions'][number]) => {
    const isLate = session.status === 'pending' && new Date(session.sessionDate).getTime() < Date.now();
    if (session.status === 'completed') return { label: 'Hoàn thành', tone: 'bg-emerald-50 text-emerald-600', phase: 'completed' };
    if (session.status === 'checked_in') return { label: 'Đang chăm sóc', tone: 'bg-brand/10 text-brand', phase: 'active' };
    if (isLate) return { label: 'Trễ giờ', tone: 'bg-amber-50 text-amber-700', phase: 'late' };
    return { label: 'Chưa bắt đầu', tone: 'bg-slate-50 text-slate-400', phase: 'pending' };
};

const quickFeedbackTags = ['Đúng giờ', 'Thái độ tốt', 'Chăm sóc kỹ', 'Tư vấn dễ hiểu', 'Bé/mẹ thoải mái', 'Cần cải thiện giao tiếp', 'Chưa đúng mong đợi'];

const PackageProgressTracker: React.FC<Props> = ({ bookingId, bookingStatus, finalReviewRating, finalReviewComment, finalReviewCreatedAt, onProgressChanged }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [progress, setProgress] = useState<PackageProgressDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [nurseNote, setNurseNote] = useState('');
    const [reviewForms, setReviewForms] = useState<Record<number, { rating: number; note: string; tags: string[] }>>({});
    const [reviewLoadingId, setReviewLoadingId] = useState<number | null>(null);
    const [finalReviewForm, setFinalReviewForm] = useState({ rating: finalReviewRating ?? 5, comment: finalReviewComment ?? '' });
    const [finalReviewLoading, setFinalReviewLoading] = useState(false);

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

    useEffect(() => {
        setFinalReviewForm({ rating: finalReviewRating ?? 5, comment: finalReviewComment ?? '' });
    }, [finalReviewRating, finalReviewComment]);

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

    const updateReviewForm = (sessionId: number, patch: Partial<{ rating: number; note: string; tags: string[] }>) => {
        setReviewForms((prev) => ({
            ...prev,
            [sessionId]: {
                rating: prev[sessionId]?.rating ?? 5,
                note: prev[sessionId]?.note ?? '',
                tags: prev[sessionId]?.tags ?? [],
                ...patch,
            },
        }));
    };

    const toggleReviewTag = (sessionId: number, tag: string) => {
        const currentTags = reviewForms[sessionId]?.tags ?? [];
        updateReviewForm(sessionId, {
            tags: currentTags.includes(tag)
                ? currentTags.filter((item) => item !== tag)
                : [...currentTags, tag],
        });
    };

    const handleSubmitSessionReview = async (sessionId: number) => {
        const form = reviewForms[sessionId] ?? { rating: 5, note: '', tags: [] };
        try {
            setReviewLoadingId(sessionId);
            await caremateApi.submitPackageSessionFeedback(bookingId, sessionId, {
                rating: form.rating,
                note: form.note.trim() || undefined,
                tags: form.tags,
            });
            await fetchProgress();
            showToast('Đã lưu đánh giá cho buổi chăm sóc.', 'success');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            showToast(error.response?.data?.message || 'Không thể lưu đánh giá buổi chăm sóc.', 'error');
        } finally {
            setReviewLoadingId(null);
        }
    };

    const handleSubmitFinalReview = async () => {
        try {
            setFinalReviewLoading(true);
            await caremateApi.createReview({
                bookingId,
                rating: finalReviewForm.rating,
                comment: finalReviewForm.comment.trim() || undefined,
            });
            showToast('Đã lưu đánh giá tổng kết gói dịch vụ.', 'success');
            onProgressChanged?.();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            showToast(error.response?.data?.message || 'Không thể lưu đánh giá tổng kết gói.', 'error');
        } finally {
            setFinalReviewLoading(false);
        }
    };

    if (loading) return <div className="text-sm text-slate-400 p-8 text-center animate-pulse">Đang tải tiến độ...</div>;
    if (!progress || progress.sessions.length === 0) return null;

    const isNurse = user?.role === 'nurse_confirmed';
    const isCustomer = user?.role === 'customer';
    const todaySession = progress.todaySession;
    const canCheckIn = isNurse && todaySession?.status === 'pending' && bookingStatus !== 'completed';
    const canCheckOut = isNurse && todaySession?.status === 'checked_in' && bookingStatus !== 'completed';
    const showNurseAction = isNurse && bookingStatus !== 'completed';
    const packageCompleted = bookingStatus === 'completed';

    return (
        <div className="mt-12 bg-white rounded-xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.06)] border border-slate-50">
            <div className="bg-slate-900 p-8 text-white">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black tracking-tight">Timeline gói dịch vụ</h3>
                        <p className="mt-2 text-sm font-medium text-white/50">
                            Mỗi buổi có giờ dự kiến, check-in, check-out và ghi chú riêng.
                        </p>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 px-4 py-2 rounded-full">
                        Tiến độ {progress.completedSessions}/{progress.totalSessions} buổi
                    </div>
                </div>
                {progress.reviewedSessions > 0 && (
                    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <div className="flex items-center gap-1 text-yellow-300">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <StarIcon key={index} className={`h-4 w-4 ${index < Math.round(progress.averageCustomerRating ?? 0) ? 'opacity-100' : 'opacity-25'}`} />
                            ))}
                        </div>
                        <span className="text-xs font-black text-white">
                            Trung bình {progress.averageCustomerRating?.toFixed(1)}/5 từ {progress.reviewedSessions} buổi đã đánh giá
                        </span>
                    </div>
                )}
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

            {packageCompleted && (
                <div className="border-b border-slate-100 bg-emerald-50/50 p-8">
                    <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-700">
                                Tổng kết sau gói
                            </div>
                            <h4 className="mt-2 text-xl font-black text-slate-900">
                                Đã hoàn thành {progress.completedSessions}/{progress.totalSessions} buổi chăm sóc
                            </h4>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-emerald-100 bg-white p-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Buổi đã đánh giá</div>
                                    <div className="mt-2 text-2xl font-black text-slate-900">{progress.reviewedSessions}</div>
                                </div>
                                <div className="rounded-xl border border-emerald-100 bg-white p-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Điểm trung bình</div>
                                    <div className="mt-2 text-2xl font-black text-slate-900">
                                        {progress.averageCustomerRating ? progress.averageCustomerRating.toFixed(1) : '--'}/5
                                    </div>
                                </div>
                                <div className="rounded-xl border border-emerald-100 bg-white p-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Đánh giá cuối</div>
                                    <div className="mt-2 text-2xl font-black text-slate-900">{finalReviewRating ? `${finalReviewRating}/5` : 'Chưa có'}</div>
                                </div>
                            </div>
                        </div>

                        {finalReviewRating ? (
                            <div className="rounded-xl border border-emerald-100 bg-white p-5">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Đánh giá cuối cùng</span>
                                    <div className="flex text-yellow-400">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <StarIcon key={index} className={`h-5 w-5 ${index < finalReviewRating ? 'opacity-100' : 'opacity-25'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="mt-3 text-sm font-semibold leading-7 text-slate-700">
                                    {finalReviewComment || 'Khách hàng chưa để lại nhận xét tổng kết.'}
                                </p>
                                {finalReviewCreatedAt && (
                                    <div className="mt-3 text-xs font-bold text-slate-400">
                                        Gửi lúc {new Date(finalReviewCreatedAt).toLocaleString('vi-VN')}
                                    </div>
                                )}
                            </div>
                        ) : isCustomer ? (
                            <div className="rounded-xl border border-brand/10 bg-white p-5">
                                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-brand">Đánh giá cuối cùng cho cả gói</div>
                                <div className="mt-3 flex gap-1 text-yellow-400">
                                    {Array.from({ length: 5 }).map((_, index) => {
                                        const star = index + 1;
                                        return (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFinalReviewForm((prev) => ({ ...prev, rating: star }))}
                                                className="rounded-lg p-1 transition hover:scale-110"
                                            >
                                                <StarIcon className={`h-7 w-7 ${star <= finalReviewForm.rating ? 'opacity-100' : 'opacity-25'}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                                <textarea
                                    value={finalReviewForm.comment}
                                    onChange={(event) => setFinalReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
                                    rows={3}
                                    maxLength={1000}
                                    placeholder="Nhận xét tổng kết sau khi hoàn thành toàn bộ gói..."
                                    className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
                                />
                                <button
                                    type="button"
                                    disabled={finalReviewLoading}
                                    onClick={() => void handleSubmitFinalReview()}
                                    className="mt-3 rounded-xl bg-brand px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {finalReviewLoading ? 'Đang lưu...' : 'Gửi đánh giá cuối'}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

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
                            const status = resolveSessionStatus(session);
                            const isCompleted = status.phase === 'completed';
                            const isCurrent = status.phase === 'active' || status.phase === 'late' || (!isCompleted && index === progress.completedSessions);
                            const isPending = status.phase === 'pending' && !isCurrent;

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
                                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-4">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                                                    Buổi {session.sessionNumber}/{progress.totalSessions}
                                                </div>
                                                <h4 className={`text-lg font-black tracking-tight ${isCurrent ? 'text-brand' : 'text-slate-900'}`}>
                                                    {session.title || `Chăm sóc ngày ${session.sessionNumber}`}
                                                </h4>
                                            </div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${status.tone}`}>
                                                {status.label}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            {session.description || 'Thực hiện các dịch vụ trong liệu trình gói.'}
                                        </p>

                                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Giờ dự kiến</div>
                                                <div className="mt-2 text-xs font-black text-slate-900">{formatDateTime(session.sessionDate)}</div>
                                            </div>
                                            <div className="rounded-xl border border-slate-100 bg-white p-4">
                                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Check-in</div>
                                                <div className="mt-2 text-xs font-black text-slate-900">{formatTime(session.checkInTime)}</div>
                                            </div>
                                            <div className="rounded-xl border border-slate-100 bg-white p-4">
                                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Check-out</div>
                                                <div className="mt-2 text-xs font-black text-slate-900">{formatTime(session.checkOutTime)}</div>
                                            </div>
                                            <div className="rounded-xl border border-slate-100 bg-white p-4">
                                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Thời gian thực tế</div>
                                                <div className="mt-2 text-xs font-black text-slate-900">{formatDuration(session.checkInTime, session.checkOutTime)}</div>
                                            </div>
                                        </div>
                                        {session.nurseNote && (
                                            <div className="mt-4 text-sm italic text-slate-500 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100/50">
                                                <span className="font-semibold not-italic text-yellow-700 mr-2">Ghi chú y tá:</span>
                                                {session.nurseNote}
                                            </div>
                                        )}
                                        {session.customerRating ? (
                                            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Đánh giá của khách</span>
                                                    <div className="flex text-yellow-400">
                                                        {Array.from({ length: 5 }).map((_, starIndex) => (
                                                            <StarIcon key={starIndex} className={`h-4 w-4 ${starIndex < (session.customerRating ?? 0) ? 'opacity-100' : 'opacity-25'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                                                    {session.customerNote || 'Khách hàng chưa để lại ghi chú.'}
                                                </p>
                                                {session.customerTags.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {session.customerTags.map((tag) => (
                                                            <span key={tag} className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : isCustomer && session.status === 'completed' ? (
                                            <div className="mt-4 rounded-xl border border-brand/10 bg-brand/5 p-4">
                                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-brand">Đánh giá buổi này</div>
                                                <div className="mt-3 flex gap-1">
                                                    {Array.from({ length: 5 }).map((_, starIndex) => {
                                                        const star = starIndex + 1;
                                                        const rating = reviewForms[session.id]?.rating ?? 5;
                                                        return (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => updateReviewForm(session.id, { rating: star })}
                                                                className="rounded-lg p-1 text-yellow-400 transition hover:scale-110"
                                                            >
                                                                <StarIcon className={`h-6 w-6 ${star <= rating ? 'opacity-100' : 'opacity-25'}`} />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {quickFeedbackTags.map((tag) => {
                                                        const active = (reviewForms[session.id]?.tags ?? []).includes(tag);
                                                        return (
                                                            <button
                                                                key={tag}
                                                                type="button"
                                                                onClick={() => toggleReviewTag(session.id, tag)}
                                                                className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition ${
                                                                    active
                                                                        ? 'border-brand bg-brand text-white shadow-lg shadow-pink-500/10'
                                                                        : 'border-slate-200 bg-white text-slate-500 hover:border-brand hover:text-brand'
                                                                }`}
                                                            >
                                                                {tag}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <textarea
                                                    value={reviewForms[session.id]?.note ?? ''}
                                                    onChange={(event) => updateReviewForm(session.id, { note: event.target.value })}
                                                    rows={3}
                                                    maxLength={1000}
                                                    placeholder="Ghi chú cảm nhận sau buổi chăm sóc..."
                                                    className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={reviewLoadingId === session.id}
                                                    onClick={() => void handleSubmitSessionReview(session.id)}
                                                    className="mt-3 rounded-xl bg-brand px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {reviewLoadingId === session.id ? 'Đang lưu...' : 'Lưu đánh giá'}
                                                </button>
                                            </div>
                                        ) : null}
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
