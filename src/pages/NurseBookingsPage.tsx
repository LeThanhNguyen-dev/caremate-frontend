import { useEffect, useState, useCallback, useMemo, type ComponentType, type SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import caremateApi from '../api/caremateApi';
import type { BookingDetailDto } from '../api/frontend-api-contract';
import { 
    CalendarDaysIcon, 
    MapPinIcon, 
    ClockIcon, 
    ChevronRightIcon,
    CheckBadgeIcon,
    XCircleIcon,
    PlayIcon,
    CheckIcon,
    InboxStackIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import NursePendingApproval from '../components/nurse/NursePendingApproval';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
const PLATFORM_FEE_RATE = 0.15;
const getPlatformFee = (totalPrice: number) => Math.round(totalPrice * PLATFORM_FEE_RATE);
const getNursePayout = (booking: BookingDetailDto) =>
    booking.nursePayoutAmount ?? booking.totalPrice - getPlatformFee(booking.totalPrice);

const statusConfig: Record<string, { label: string; class: string; icon: IconComponent }> = {
    pending_confirm: { 
        label: 'Chờ xác nhận', 
        class: 'bg-amber-50 text-amber-600 border-amber-100',
        icon: ClockIcon 
    },
    confirmed: { 
        label: 'Đã xác nhận', 
        class: 'bg-emerald-50 text-[#10B981] border-emerald-100',
        icon: CheckBadgeIcon 
    },
    in_progress: { 
        label: 'Đang thực hiện', 
        class: 'bg-blue-50 text-blue-600 border-blue-100',
        icon: PlayIcon 
    },
    completed: { 
        label: 'Hoàn thành', 
        class: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: CheckIcon 
    },
    cancelled: { 
        label: 'Đã hủy', 
        class: 'bg-red-50 text-red-600 border-red-100',
        icon: XCircleIcon 
    },
    rejected: { 
        label: 'Bị từ chối', 
        class: 'bg-slate-50 text-slate-500 border-slate-200',
        icon: XCircleIcon 
    },
};

const filterOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending_confirm', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'in_progress', label: 'Đang thực hiện' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
    { value: 'rejected', label: 'Từ chối' },
] as const;

type BookingFilter = typeof filterOptions[number]['value'];

const isSameLocalDay = (value: string, date = new Date()) => {
    const bookingDate = new Date(value);
    return bookingDate.getFullYear() === date.getFullYear()
        && bookingDate.getMonth() === date.getMonth()
        && bookingDate.getDate() === date.getDate();
};

const NurseBookingsPage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [bookings, setBookings] = useState<BookingDetailDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<BookingFilter>('all');
    const [todayOnly, setTodayOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await caremateApi.getMyNurseBookings();
            setBookings(data);
        } catch {
            showToast('Không thể tải danh sách lịch hẹn.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const updateStatus = async (id: number, status: string) => {
        try {
            await caremateApi.updateBookingStatus(id, { status });
            showToast('Cập nhật trạng thái thành công.', 'success');
            await load();
        } catch {
            showToast('Không thể cập nhật trạng thái.', 'error');
        }
    };

    const bookingStats = useMemo(() => {
        const today = bookings.filter((booking) => isSameLocalDay(booking.startTime)).length;
        const needsAction = bookings.filter((booking) => booking.status === 'pending_confirm' || booking.status === 'in_progress').length;
        const upcoming = bookings.filter((booking) => {
            const startTime = new Date(booking.startTime).getTime();
            return startTime >= Date.now() && booking.status !== 'cancelled' && booking.status !== 'rejected';
        }).length;

        return { today, needsAction, upcoming };
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        const keyword = searchTerm.trim().toLocaleLowerCase('vi-VN');

        return bookings
            .filter((booking) => statusFilter === 'all' || booking.status === statusFilter)
            .filter((booking) => !todayOnly || isSameLocalDay(booking.startTime))
            .filter((booking) => {
                if (!keyword) return true;
                const haystack = [
                    booking.id,
                    booking.serviceName,
                    booking.address,
                    booking.notes,
                    booking.status,
                ].join(' ').toLocaleLowerCase('vi-VN');
                return haystack.includes(keyword);
            })
            .sort((a, b) => {
                const priority: Record<string, number> = {
                    pending_confirm: 0,
                    in_progress: 1,
                    confirmed: 2,
                    completed: 3,
                    cancelled: 4,
                    rejected: 5,
                };
                const statusPriority = (priority[a.status] ?? 9) - (priority[b.status] ?? 9);
                if (statusPriority !== 0) return statusPriority;
                return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
            });
    }, [bookings, searchTerm, statusFilter, todayOnly]);

    if (user?.role !== 'nurse_confirmed') {
        return <NursePendingApproval />;
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#10B981] border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang đồng bộ lịch hẹn...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-[#10B981] text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                        Quản trị vận hành
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Lịch hẹn điều dưỡng</h1>
                    <p className="text-slate-500 font-medium text-lg">
                        Bạn có <span className="text-[#10B981] font-black">{bookingStats.needsAction}</span> lịch hẹn cần xử lý và <span className="text-[#10B981] font-black">{bookingStats.upcoming}</span> ca sắp tới.
                    </p>
                </div>
                
                <div className="flex flex-col gap-3 md:min-w-[340px]">
                    <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Tìm theo mã, dịch vụ, địa chỉ..."
                        className="h-11 rounded-xl border border-slate-100 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5"
                    />
                    <div className="flex rounded-xl bg-white p-1.5 shadow-sm border border-slate-50">
                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter('all');
                                setTodayOnly(false);
                            }}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                statusFilter === 'all' && !todayOnly
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-[#10B981]'
                            }`}
                        >
                            Tất cả
                        </button>
                        <button
                            type="button"
                            onClick={() => setTodayOnly((value) => !value)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                todayOnly
                                    ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-600/20'
                                    : 'text-slate-400 hover:text-[#10B981]'
                            }`}
                        >
                            Hôm nay ({bookingStats.today})
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => {
                    const count = option.value === 'all'
                        ? bookings.length
                        : bookings.filter((booking) => booking.status === option.value).length;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setStatusFilter(option.value)}
                            className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                statusFilter === option.value
                                    ? 'border-emerald-200 bg-emerald-50 text-[#10B981]'
                                    : 'border-slate-100 bg-white text-slate-400 hover:border-emerald-100 hover:text-[#10B981]'
                            }`}
                        >
                            {option.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* List */}
            <div data-tour="nurse-bookings-list" className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {filteredBookings.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl p-24 text-center border border-slate-50 shadow-xl shadow-slate-200/20"
                        >
                            <InboxStackIcon className="h-16 w-16 mx-auto text-slate-100 mb-8" />
                            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Không có lịch hẹn phù hợp</h3>
                            <p className="text-slate-400 text-lg font-medium">Thử đổi bộ lọc hoặc từ khóa để xem các lịch hẹn khác.</p>
                        </motion.div>
                    ) : (
                        filteredBookings.map((booking, idx) => {
                            const config = statusConfig[booking.status] || statusConfig.rejected;
                            const isPackage = booking.serviceKind === 'package' || Boolean(booking.packageDays && booking.packageDays > 0);
                            return (
                                <motion.div 
                                    key={booking.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-emerald-600/5 transition-all duration-500 overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -mr-32 -mt-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                                            <div className="h-20 w-20 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-slate-900/10 group-hover:scale-105 transition-transform">
                                                {booking.id}
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-4">
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{booking.serviceName}</h3>
                                                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${config.class} flex items-center gap-2`}>
                                                        <config.icon className="h-3 w-3" />
                                                        {config.label}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-6 items-center">
                                                    <div className="flex items-center gap-2.5 text-sm font-bold text-slate-500">
                                                        <CalendarDaysIcon className="h-5 w-5 text-[#10B981]" />
                                                        {new Date(booking.startTime).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-sm font-bold text-slate-500">
                                                        <ClockIcon className="h-5 w-5 text-[#10B981]" />
                                                        {new Date(booking.startTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-sm font-bold text-slate-500">
                                                        <MapPinIcon className="h-5 w-5 text-[#10B981]" />
                                                        {booking.address || 'Tại địa điểm yêu cầu'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <Link 
                                                to={`/bookings/${booking.id}`} 
                                                className="px-6 py-4 rounded-xl bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-100"
                                            >
                                                Chi tiết & Chat
                                                <ChevronRightIcon className="h-4 w-4" />
                                            </Link>

                                            {booking.status === 'pending_confirm' && (
                                                <>
                                                    <button 
                                                        onClick={() => void updateStatus(booking.id, 'confirmed')}
                                                        className="bg-[#10B981] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all"
                                                    >
                                                        Chấp nhận
                                                    </button>
                                                    <button 
                                                        onClick={() => void updateStatus(booking.id, 'rejected')}
                                                        className="px-8 py-4 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
                                                    >
                                                        Từ chối
                                                    </button>
                                                </>
                                            )}

                                            {booking.status === 'confirmed' && !isPackage && (
                                                <button 
                                                    onClick={() => void updateStatus(booking.id, 'in_progress')}
                                                    className="bg-[#10B981] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all flex items-center gap-3"
                                                >
                                                    <PlayIcon className="h-4 w-4" />
                                                    Bắt đầu thực hiện
                                                </button>
                                            )}

                                            {booking.status === 'in_progress' && !isPackage && (
                                                <button 
                                                    onClick={() => void updateStatus(booking.id, 'completed')}
                                                    className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all flex items-center gap-3"
                                                >
                                                    <CheckIcon className="h-4 w-4" />
                                                    Hoàn thành ca
                                                </button>
                                            )}
                                            {isPackage && (booking.status === 'confirmed' || booking.status === 'in_progress') && (
                                                <Link
                                                    to={`/bookings/${booking.id}`}
                                                    className="bg-[#10B981] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all flex items-center gap-3"
                                                >
                                                    <PlayIcon className="h-4 w-4" />
                                                    Theo dõi từng buổi
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {booking.notes && (
                                        <div className="mt-8 pt-8 border-t border-slate-50 text-xs font-medium text-slate-400 leading-relaxed italic">
                                            Ghi chú khách hàng: "{booking.notes}"
                                        </div>
                                    )}
                                    <div className="mt-6 grid gap-3 border-t border-slate-50 pt-6 sm:grid-cols-3">
                                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Khách trả</div>
                                            <div className="mt-1 text-sm font-black text-slate-900">{booking.totalPrice.toLocaleString('vi-VN')}đ</div>
                                        </div>
                                        <div className="rounded-xl bg-rose-50 px-4 py-3">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-rose-400">Phí nền tảng 15%</div>
                                            <div className="mt-1 text-sm font-black text-rose-700">{(booking.platformFee ?? getPlatformFee(booking.totalPrice)).toLocaleString('vi-VN')}đ</div>
                                        </div>
                                        <div className="rounded-xl bg-emerald-50 px-4 py-3">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Y tá thực nhận</div>
                                            <div className="mt-1 text-sm font-black text-emerald-700">{getNursePayout(booking).toLocaleString('vi-VN')}đ</div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NurseBookingsPage;
