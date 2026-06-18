import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CalendarDaysIcon, 
    MapPinIcon, 
    BanknotesIcon, 
    ClipboardDocumentListIcon,
    ExclamationTriangleIcon,
    CheckBadgeIcon,
    ClockIcon,
    ArrowPathIcon,
    PlusIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useToast } from '../hooks/useToast';
import caremateApi from '../api/caremateApi';
import type { BookingDetailDto, Dispute } from '../api/frontend-api-contract';
import { STATUS_LABELS, REFUND_STATUS_LABELS } from '../constants/booking';

const statusConfig: Record<string, { label: string; className: string; icon: typeof ClockIcon }> = {
    pending_confirm: { label: STATUS_LABELS.pending_confirm, className: 'bg-amber-50 text-amber-600 border-amber-100', icon: ClockIcon },
    confirmed: { label: STATUS_LABELS.confirmed, className: 'bg-blue-50 text-blue-600 border-blue-100', icon: CheckBadgeIcon },
    in_progress: { label: STATUS_LABELS.in_progress, className: 'bg-brand/5 text-brand border-brand/10', icon: ArrowPathIcon },
    completed: { label: STATUS_LABELS.completed, className: 'bg-green-50 text-green-600 border-green-100', icon: CheckBadgeIcon },
    cancelled: { label: STATUS_LABELS.cancelled, className: 'bg-slate-50 text-slate-400 border-slate-100', icon: ExclamationTriangleIcon },
    rejected: { label: STATUS_LABELS.rejected, className: 'bg-red-50 text-red-600 border-red-100', icon: ExclamationTriangleIcon },
};

const refundStatusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: REFUND_STATUS_LABELS.pending, className: 'bg-amber-50 text-amber-700 border-amber-100' },
    completed: { label: REFUND_STATUS_LABELS.completed, className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    failed: { label: REFUND_STATUS_LABELS.failed, className: 'bg-red-50 text-red-700 border-red-100' },
};

const CustomerBookingsPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [bookings, setBookings] = useState<BookingDetailDto[]>([]);
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; bookingId: number | null }>({ isOpen: false, bookingId: null });
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [disputeModal, setDisputeModal] = useState<{ isOpen: boolean; bookingId: number | null }>({ isOpen: false, bookingId: null });
    const [disputeReason, setDisputeReason] = useState('');

    const load = useCallback(async () => {
        setLoading(true);

        const [bookingResult, disputeResult] = await Promise.allSettled([
            caremateApi.getMyCustomerBookings(),
            caremateApi.getDisputes(),
        ]);

        if (bookingResult.status === 'fulfilled') {
            setBookings(bookingResult.value);
        } else {
            setBookings([]);
            showToast('Không thể tải danh sách đặt lịch.', 'error');
        }

        if (disputeResult.status === 'fulfilled') {
            setDisputes(disputeResult.value);
        } else {
            setDisputes([]);
        }

        setLoading(false);
    }, [showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const filteredBookings = useMemo(
        () => (filter === 'all' ? bookings : bookings.filter((item) => item.status === filter)),
        [bookings, filter],
    );

    const summary = useMemo(() => {
        return {
            total: bookings.length,
            active: bookings.filter((item) => item.status === 'confirmed' || item.status === 'in_progress').length,
            completed: bookings.filter((item) => item.status === 'completed').length,
            disputes: disputes.length,
        };
    }, [bookings, disputes]);

    const disputeByBookingId = useMemo(() => {
        return new Map(disputes.map((item) => [item.bookingId, item]));
    }, [disputes]);

    const cancelBooking = async (bookingId: number) => {
        try {
            await caremateApi.cancelBooking(bookingId, { reason: 'Khách hàng hủy yêu cầu' });
            showToast('Đã hủy yêu cầu thành công.', 'success');
            await load();
        } catch {
            showToast('Không thể hủy yêu cầu lúc này.', 'error');
        }
    };

    const payBooking = async (bookingId: number) => {
        try {
            const paymentLink = await caremateApi.createPayOSPaymentLink(bookingId);
            window.location.href = paymentLink.checkoutUrl;
        } catch {
            showToast('Không thể tạo liên kết thanh toán.', 'error');
        }
    };

    const submitReview = async () => {
        if (!reviewModal.bookingId) return;
        try {
            await caremateApi.createReview({
                bookingId: reviewModal.bookingId,
                rating: reviewForm.rating,
                comment: reviewForm.comment,
            });
            showToast('Cảm ơn bạn đã gửi đánh giá!', 'success');
            setReviewModal({ isOpen: false, bookingId: null });
            setReviewForm({ rating: 5, comment: '' });
            await load();
        } catch {
            showToast('Không thể gửi đánh giá.', 'error');
        }
    };

    const submitDispute = async () => {
        if (!disputeModal.bookingId || !disputeReason.trim()) return;
        try {
            await caremateApi.createDispute({ bookingId: disputeModal.bookingId, reason: disputeReason });
            showToast('Đã gửi khiếu nại đến quản trị viên.', 'success');
            setDisputeModal({ isOpen: false, bookingId: null });
            setDisputeReason('');
            await load();
        } catch {
            showToast('Không thể gửi khiếu nại.', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-brand border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang tải danh sách...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen py-20 px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <section className="grid gap-8 lg:grid-cols-[1fr_0.4fr] mb-16">
                    <div className="bg-slate-900 rounded-xl p-12 relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 blur-[120px] -mr-48 -mt-48 rounded-full"></div>
                        <div className="relative z-10">
                            <div className="accent-label !bg-white/10 !text-white border-white/20">Dịch vụ đã đặt</div>
                            <h1 className="mt-6 text-4xl lg:text-5xl font-black text-white leading-tight">
                                Quản lý <span className="text-brand">nhật ký chăm sóc</span> của bạn
                            </h1>
                            <p className="mt-6 max-w-xl text-lg font-medium text-white/50">
                                Theo dõi tiến độ, thanh toán và gửi phản hồi cho các dịch vụ bạn đã đăng ký một cách dễ dàng.
                            </p>
                            <div className="mt-10">
                                <Link to="/services" className="btn-primary !px-10 !py-5 shadow-2xl shadow-pink-500/20 flex items-center gap-3 w-fit">
                                    <PlusIcon className="h-5 w-5" />
                                    Đặt dịch vụ mới
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-1">
                        {[
                            { label: 'Tổng số dịch vụ', value: summary.total, icon: ClipboardDocumentListIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { label: 'Đang diễn ra', value: summary.active, icon: ArrowPathIcon, color: 'text-brand', bg: 'bg-brand/5' },
                            { label: 'Đã hoàn thành', value: summary.completed, icon: CheckBadgeIcon, color: 'text-green-600', bg: 'bg-green-50' },
                            { label: 'Khiếu nại', value: summary.disputes, icon: ExclamationTriangleIcon, color: 'text-red-600', bg: 'bg-red-50' },
                        ].map((card) => (
                            <div key={card.label} className="bg-white rounded-xl p-8 border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6">
                                <div className={`h-14 w-14 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                                    <card.icon className="h-7 w-7" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{card.label}</div>
                                    <div className="text-3xl font-black text-slate-900">{card.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <div className="flex flex-wrap gap-3 p-2 bg-white rounded-xl border border-slate-100 shadow-lg shadow-slate-200/10 w-fit">
                        {[{ key: 'all', label: 'Tất cả' }, ...Object.entries(statusConfig).map(([key, item]) => ({ key, label: item.label }))].map((tab) => (
                            <button 
                                key={tab.key} 
                                onClick={() => setFilter(tab.key)} 
                                className={`rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filter === tab.key ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </section>

                <AnimatePresence mode="wait">
                    {filteredBookings.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl p-32 text-center border border-slate-100 shadow-xl shadow-slate-200/20"
                        >
                            <div className="h-24 w-24 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-8">
                                <CalendarDaysIcon className="h-10 w-10 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Chưa có bản ghi nào</h3>
                            <p className="text-slate-400 text-sm font-medium">Thay đổi bộ lọc hoặc bắt đầu dịch vụ đầu tiên cùng CareMate.</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-8">
                            {filteredBookings.map((booking) => {
                                const status = statusConfig[booking.status] || { label: booking.status, className: 'bg-slate-50 text-slate-600', icon: ClockIcon };
                                const refundStatus = booking.refundStatus ? refundStatusConfig[booking.refundStatus] : null;
                                const dispute = disputeByBookingId.get(booking.id);
                                return (
                                    <motion.div 
                                        key={booking.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-xl p-8 lg:p-12 border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-pink-500/5 transition-all duration-500"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-6 mb-10">
                                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{booking.serviceName}</h2>
                                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${status.className}`}>
                                                        <status.icon className="h-4 w-4" />
                                                        {status.label}
                                                    </div>
                                                    {refundStatus && (
                                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${refundStatus.className}`}>
                                                            <BanknotesIcon className="h-4 w-4" />
                                                            {refundStatus.label}
                                                        </div>
                                                    )}
                                                    {dispute && (
                                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                                            Khiếu nại: {dispute.status}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                                                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Mã đơn hàng</div>
                                                        <div className="text-base font-black text-slate-900 group-hover:text-brand transition-colors">#{booking.id}</div>
                                                    </div>
                                                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Thời gian</div>
                                                        <div className="text-base font-black text-slate-900 flex items-center gap-2">
                                                            <ClockIcon className="h-4 w-4 text-brand" />
                                                            {new Date(booking.startTime).toLocaleString('vi-VN')}
                                                        </div>
                                                    </div>
                                                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Địa điểm</div>
                                                        <div className="text-base font-black text-slate-900 truncate" title={booking.address}>
                                                            <MapPinIcon className="h-4 w-4 text-brand mb-1 inline" /> {booking.address}
                                                        </div>
                                                    </div>
                                                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Tổng thanh toán</div>
                                                        <div className="text-base font-black text-slate-900 flex items-center gap-2">
                                                            <BanknotesIcon className="h-4 w-4 text-brand" />
                                                            {booking.totalPrice.toLocaleString('vi-VN')}đ
                                                        </div>
                                                    </div>
                                                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all sm:col-span-2 xl:col-span-4">
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Tình trạng hoàn tiền</div>
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <div className="text-base font-black text-slate-900">
                                                                {booking.refundStatus === 'completed'
                                                                    ? 'Đã hoàn tiền'
                                                                    : booking.refundStatus === 'pending'
                                                                        ? `Đang chờ hoàn ${booking.refundAmount?.toLocaleString('vi-VN') ?? 0}đ`
                                                                        : 'Chưa phát sinh hoàn tiền'}
                                                            </div>
                                                            {booking.refundedAt && (
                                                                <div className="text-xs font-bold text-slate-400">
                                                                    Hoàn lúc: {new Date(booking.refundedAt).toLocaleString('vi-VN')}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {booking.refundReason && (
                                                            <div className="mt-2 text-sm font-medium text-slate-500">
                                                                {booking.refundReason}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 lg:w-[220px]">
                                                <button onClick={() => navigate(`/bookings/${booking.id}`)} className="w-full btn-secondary !rounded-xl !py-4 text-[10px] font-black uppercase tracking-widest">
                                                    Chi tiết
                                                </button>
                                                {booking.status === 'pending_confirm' && (
                                                    <button onClick={() => void cancelBooking(booking.id)} className="w-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                        Hủy lịch
                                                    </button>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <button onClick={() => void payBooking(booking.id)} className="w-full btn-primary !rounded-xl !py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-500/20">
                                                        Thanh toán qua payOS
                                                    </button>
                                                )}
                                                {booking.status === 'completed' && (
                                                    <>
                                                        <button disabled={Boolean(booking.finalReviewRating)} onClick={() => !booking.finalReviewRating && setReviewModal({ isOpen: true, bookingId: booking.id })} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${booking.finalReviewRating ? 'cursor-default bg-emerald-50 text-emerald-700' : 'bg-brand/5 text-brand hover:bg-brand hover:text-white'}`}>
                                                            <span>{booking.finalReviewRating ? `Đã đánh giá ${booking.finalReviewRating}/5` : 'Đánh giá cuối cùng'}</span>
                                                            <span className="hidden">
                                                            Đánh giá buổi chăm sóc
                                                            </span>
                                                        </button>
                                                        {!dispute && (
                                                            <button onClick={() => setDisputeModal({ isOpen: true, bookingId: booking.id })} className="w-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                                Khiếu nại
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>

                {/* Modals */}
                <AnimatePresence>
                    {reviewModal.isOpen && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-md">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-xl bg-white p-12 shadow-2xl">
                                <h3 className="text-3xl font-black text-slate-900 mb-8">Đánh giá buổi chăm sóc</h3>
                                <div className="space-y-8">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Mức độ hài lòng</label>
                                        <div className="flex gap-4">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))} className={`h-14 w-14 rounded-xl flex items-center justify-center text-2xl transition-all ${ star <= reviewForm.rating ? 'bg-brand text-white shadow-lg shadow-pink-500/20' : 'bg-slate-50 text-slate-300' }`}>
                                                    <StarSolid className="h-6 w-6" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Chia sẻ cảm nhận</label>
                                        <textarea className="w-full bg-slate-50 border-none rounded-xl p-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all" rows={4} value={reviewForm.comment} onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))} placeholder="Bạn thấy điều dưỡng chăm sóc thế nào?" />
                                    </div>
                                </div>
                                <div className="mt-10 flex gap-4">
                                    <button onClick={() => setReviewModal({ isOpen: false, bookingId: null })} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Đóng</button>
                                    <button onClick={() => void submitReview()} className="flex-1 btn-primary !rounded-xl">Gửi đánh giá</button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {disputeModal.isOpen && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-md">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg rounded-xl bg-white p-12 shadow-2xl">
                                <h3 className="text-3xl font-black text-slate-900 mb-4 text-red-600">Gửi khiếu nại</h3>
                                <p className="text-sm font-medium text-slate-400 mb-10">CareMate sẽ tiếp nhận và xử lý sự cố trong vòng 24 giờ làm việc.</p>
                                <div className="space-y-8">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Mô tả sự cố</label>
                                        <textarea className="w-full bg-slate-50 border-none rounded-xl p-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-red-500/5 transition-all" rows={6} value={disputeReason} onChange={(event) => setDisputeReason(event.target.value)} placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..." />
                                    </div>
                                </div>
                                <div className="mt-10 flex gap-4">
                                    <button onClick={() => setDisputeModal({ isOpen: false, bookingId: null })} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Hủy bỏ</button>
                                    <button onClick={() => void submitDispute()} className="flex-1 bg-red-600 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20">Gửi khiếu nại</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CustomerBookingsPage;



