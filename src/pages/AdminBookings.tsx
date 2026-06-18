import { useEffect, useMemo, useState } from 'react';
import caremateApi from '../api/caremateApi';
import type { AdminBookingSummaryDto, AdminRefundDto } from '../api/frontend-api-contract';
import { 
    CalendarDaysIcon, 
    CurrencyDollarIcon, 
    ClipboardDocumentListIcon,
    ArrowPathIcon,
    QrCodeIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { getPlatformFee, STATUS_LABELS } from '../constants/booking';

const getNursePayout = (booking: AdminBookingSummaryDto) =>
    booking.nursePayoutAmount ?? booking.totalPrice - getPlatformFee(booking.totalPrice);

const AdminBookings = () => {
    const [bookings, setBookings] = useState<AdminBookingSummaryDto[]>([]);
    const [refunds, setRefunds] = useState<AdminRefundDto[]>([]);
    const [payouts, setPayouts] = useState<import('../api/frontend-api-contract').AdminPayoutDto[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            setLoading(true);
            const [data, refundData, payoutData] = await Promise.all([
                caremateApi.getAdminBookings(),
                caremateApi.getAdminRefunds(),
                caremateApi.getAdminPayouts(),
            ]);
            setBookings(data);
            setRefunds(refundData);
            setPayouts(payoutData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const [now] = useState(() => Date.now());

    const stats = useMemo(() => {
        const revenue = bookings.reduce((sum, item) => sum + item.totalPrice, 0);
        const platformFee = bookings.reduce((sum, item) => sum + (item.platformFee ?? getPlatformFee(item.totalPrice)), 0);
        const nursePayout = bookings.reduce((sum, item) => sum + getNursePayout(item), 0);
        const upcoming = bookings.filter((item) => new Date(item.startTime).getTime() >= now).length;
        const pending = bookings.filter((item) => item.status === 'pending_confirm').length;
        return { revenue, platformFee, nursePayout, upcoming, pending };
    }, [bookings, now]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-admin border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">Đang tải dữ liệu vận hành...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 selection:bg-admin/10">
            {/* Header Hero Section */}
            <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
                <div className="luxury-card bg-[#111827] text-white p-12 border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-admin/10 blur-[100px] rounded-full"></div>
                    <div className="relative z-10">
                        <div className="accent-label !bg-white/10 !text-white border-white/10">Điều phối vận hành</div>
                        <h1 className="text-4xl font-black text-white mt-4">Quản lý Lịch hẹn</h1>
                        <p className="mt-4 max-w-2xl text-sm font-medium text-white/50 leading-relaxed">
                            Theo dõi toàn bộ lịch hẹn trên hệ thống, kiểm soát trạng thái giao dịch và tổng hợp doanh thu từ các dịch vụ chăm sóc.
                        </p>
                        <div className="mt-8 flex gap-4">
                            <button onClick={load} className="btn-primary !bg-admin shadow-lg shadow-blue-500/20 px-8 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <ArrowPathIcon className="h-4 w-4" /> Làm mới dữ liệu
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    {[
                        { label: 'Tổng doanh thu', value: `${stats.revenue.toLocaleString('vi-VN')}đ`, icon: CurrencyDollarIcon, color: 'text-green-600 bg-green-50' },
                        { label: 'Phí web 15%', value: `${stats.platformFee.toLocaleString('vi-VN')}đ`, icon: CurrencyDollarIcon, color: 'text-rose-600 bg-rose-50' },
                        { label: 'Chi y tá 85%', value: `${stats.nursePayout.toLocaleString('vi-VN')}đ`, icon: CurrencyDollarIcon, color: 'text-emerald-600 bg-emerald-50' },
                        { label: 'Booking sắp tới', value: stats.upcoming, icon: CalendarDaysIcon, color: 'text-admin bg-admin/5' },
                        { label: 'Chờ xác nhận', value: stats.pending, icon: ClockIcon, color: 'text-amber-600 bg-amber-50' },
                    ].map((item) => (
                        <div key={item.label} className="luxury-card p-6 flex items-center gap-5">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.color}`}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                                <div className="mt-1 text-2xl font-black text-slate-900">{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Table Section */}
            <section className="luxury-card p-0 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Nhật ký giao dịch</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Danh sách chi tiết booking toàn hệ thống</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                        <ClipboardDocumentListIcon className="h-6 w-6" />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Mã số</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Khách hàng</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Y tá</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Thời gian</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Giá trị</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <ClipboardDocumentListIcon className="h-12 w-12 text-slate-200" />
                                            <p className="text-sm font-bold text-slate-400">Chưa có dữ liệu lịch hẹn nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6 text-sm font-black text-slate-900">#{booking.id}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">C</div>
                                                <div className="text-xs font-bold text-slate-700">ID: {booking.customerId}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-xl bg-admin/5 flex items-center justify-center text-[10px] font-black text-admin">N</div>
                                                <div className="text-xs font-bold text-slate-700">ID: {booking.nurseId}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-xs font-black text-slate-900">{new Date(booking.startTime).toLocaleDateString('vi-VN')}</div>
                                            <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                                                {new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-slate-900">{booking.totalPrice.toLocaleString('vi-VN')}đ</div>
                                            <div className="mt-1 text-[10px] font-bold text-rose-500">Web 15%: {(booking.platformFee ?? getPlatformFee(booking.totalPrice)).toLocaleString('vi-VN')}đ</div>
                                            <div className="text-[10px] font-bold text-emerald-600">Y tá 85%: {getNursePayout(booking).toLocaleString('vi-VN')}đ</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                                booking.status === 'completed' ? 'bg-green-50 text-green-600' :
                                                booking.status === 'pending_confirm' ? 'bg-amber-50 text-amber-600' :
                                                booking.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {STATUS_LABELS[booking.status] ?? booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="luxury-card p-0 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Hoàn tiền thủ công</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hiển thị QR khách hàng để admin chuyển khoản tay</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                        <QrCodeIcon className="h-6 w-6" />
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {refunds.length === 0 ? (
                        <div className="rounded-xl bg-slate-50 p-10 text-center text-sm font-bold text-slate-400">
                            Chưa có yêu cầu hoàn tiền nào cần xử lý.
                        </div>
                    ) : (
                        refunds.map((refund) => (
                            <div key={refund.bookingId} className="rounded-xl border border-slate-100 p-6">
                                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-2">
                                        <div className="text-lg font-black text-slate-900">Booking #{refund.bookingId} • {refund.serviceName}</div>
                                        <div className="text-sm font-bold text-slate-500">Khách: {refund.customerName} • Y tá: {refund.nurseName}</div>
                                        <div className="text-sm font-bold text-slate-500">
                                            Trạng thái booking: {STATUS_LABELS[refund.bookingStatus] ?? refund.bookingStatus}
                                        </div>
                                        <div className="text-sm font-bold text-slate-500">
                                            Hoàn: {refund.refundAmount.toLocaleString('vi-VN')}đ
                                        </div>
                                        <div className="text-sm font-medium text-slate-400">{refund.refundReason || 'Không có ghi chú hoàn tiền.'}</div>
                                        <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            {refund.refundStatus === 'completed'
                                                ? 'Đã hoàn tiền'
                                                : refund.refundStatus === 'not_required'
                                                    ? 'Không cần hoàn tiền'
                                                    : 'Chờ hoàn tiền'}
                                        </div>
                                        <div className="text-sm font-bold text-slate-600">
                                            {refund.customerBankAccountName || 'Chưa có tên TK'} • {refund.customerBankAccountNumber || 'Chưa có STK'} • {refund.customerBankBin || 'Chưa có ngân hàng'}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-4">
                                        {refund.customerQrUrl ? (
                                            <img src={refund.customerQrUrl} alt={`QR refund booking ${refund.bookingId}`} className="h-48 w-48 rounded-xl border border-slate-100 object-cover" />
                                        ) : (
                                            <div className="flex h-48 w-48 items-center justify-center rounded-xl border border-dashed border-slate-200 text-center text-xs font-bold text-slate-400">
                                                {refund.hasPayment
                                                    ? 'Khách chưa cập nhật thông tin ngân hàng'
                                                    : 'Booking này chưa phát sinh thanh toán'}
                                            </div>
                                        )}
                                        {refund.hasPayment && refund.refundAmount > 0 && refund.refundStatus !== 'completed' && (
                                            <button
                                                onClick={() => void caremateApi.completeAdminRefund(refund.bookingId).then(load)}
                                                className="rounded-xl bg-admin px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20"
                                            >
                                                Đã hoàn tiền
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className="luxury-card p-0 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Chi tiền cho y tá</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hiển thị QR y tá để admin chuyển khoản tay</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                        <QrCodeIcon className="h-6 w-6" />
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {payouts.length === 0 ? (
                        <div className="rounded-xl bg-slate-50 p-10 text-center text-sm font-bold text-slate-400">
                            Chưa có khoản chi cho y tá nào cần xử lý.
                        </div>
                    ) : (
                        payouts.map((payout) => (
                            <div key={payout.payoutId} className="rounded-xl border border-slate-100 p-6">
                                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-2">
                                        <div className="text-lg font-black text-slate-900">Payout #{payout.payoutId} • Booking #{payout.bookingId}</div>
                                        <div className="text-sm font-bold text-slate-500">Y tá: {payout.nurseName} • {payout.serviceName}</div>
                                        <div className="text-sm font-bold text-slate-500">
                                            Tổng: {(payout.grossAmount ?? payout.amount + payout.platformFee).toLocaleString('vi-VN')}đ • Web 15%: {payout.platformFee.toLocaleString('vi-VN')}đ • Chi y tá 85%: {payout.amount.toLocaleString('vi-VN')}đ
                                        </div>
                                        <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            {payout.status === 'released' ? 'Đã chi tiền' : payout.status}
                                        </div>
                                        <div className="text-sm font-bold text-slate-600">
                                            {payout.nurseBankAccountName || 'Chưa có tên TK'} • {payout.nurseBankAccountNumber || 'Chưa có STK'} • {payout.nurseBankBin || 'Chưa có ngân hàng'}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-4">
                                        {payout.nurseQrUrl ? (
                                            <img src={payout.nurseQrUrl} alt={`QR payout ${payout.payoutId}`} className="h-48 w-48 rounded-xl border border-slate-100 object-cover" />
                                        ) : (
                                            <div className="flex h-48 w-48 items-center justify-center rounded-xl border border-dashed border-slate-200 text-center text-xs font-bold text-slate-400">
                                                Y tá chưa cập nhật thông tin ngân hàng
                                            </div>
                                        )}
                                        {payout.status !== 'released' && (
                                            <button
                                                onClick={() => void caremateApi.completeAdminPayout(payout.payoutId).then(load)}
                                                className="rounded-xl bg-emerald-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20"
                                            >
                                                Đã chi tiền
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminBookings;

