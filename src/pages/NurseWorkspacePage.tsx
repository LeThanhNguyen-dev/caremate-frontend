import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import caremateApi from '../api/caremateApi';
import type { AvailabilitySlotDto, BookingDetailDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';
import { 
    CalendarIcon, 
    ClockIcon, 
    UserIcon, 
    ArrowRightIcon, 
    ChartPieIcon, 
    SparklesIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import NursePendingApproval from '../components/nurse/NursePendingApproval';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip);

const PLATFORM_FEE_RATE = 0.15;
const getPlatformFee = (totalPrice: number) => Math.round(totalPrice * PLATFORM_FEE_RATE);
const getNursePayout = (booking: BookingDetailDto) =>
    booking.nursePayoutAmount ?? booking.totalPrice - getPlatformFee(booking.totalPrice);

const bookingLabels: Record<string, string> = {
    pending_confirm: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    in_progress: 'Đang thực hiện',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    rejected: 'Bị từ chối',
};

const NurseWorkspacePage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<BookingDetailDto[]>([]);
    const [slots, setSlots] = useState<AvailabilitySlotDto[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [bookingData, slotData] = await Promise.all([
                    caremateApi.getMyNurseBookings(),
                    caremateApi.getMyAvailability()
                ]);
                setBookings(bookingData);
                setSlots(slotData);
            } catch {
                showToast('Không thể tải dữ liệu tổng quan công việc.', 'error');
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [showToast]);

    const stats = useMemo(() => {
        const now = new Date();
        const upcoming = bookings.filter((item) => new Date(item.startTime) >= now && item.status !== 'cancelled').length;
        const active = bookings.filter((item) => item.status === 'confirmed' || item.status === 'in_progress').length;
        const availableSlots = slots.filter((item) => item.isAvailable).length;
        const completedBookings = bookings.filter((item) => item.status === 'completed');
        const grossRevenue = completedBookings.reduce((acc, curr) => acc + curr.totalPrice, 0);
        const platformFee = completedBookings.reduce((acc, curr) => acc + (curr.platformFee ?? getPlatformFee(curr.totalPrice)), 0);
        const revenue = completedBookings.reduce((acc, curr) => acc + getNursePayout(curr), 0);

        return { upcoming, active, availableSlots, revenue, grossRevenue, platformFee };
    }, [bookings, slots]);

    const statusSummary = useMemo(() => {
        const map = new Map<string, number>();
        bookings.forEach((booking) => {
            map.set(booking.status, (map.get(booking.status) ?? 0) + 1);
        });
        return Array.from(map.entries());
    }, [bookings]);

    const nextBookings = useMemo(
        () => bookings
            .filter((item) => new Date(item.startTime) >= new Date() && item.status !== 'cancelled' && item.status !== 'rejected')
            .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime))
            .slice(0, 4),
        [bookings],
    );

    if (user?.role !== 'nurse_confirmed') {
        return <NursePendingApproval />;
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#10B981] border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang khởi tạo không gian làm việc...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-[1.35rem] border border-emerald-100 bg-white shadow-[0_18px_60px_rgba(15,118,110,0.08)]">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="p-5 sm:p-6 lg:p-7">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-700">
                            Kênh điều dưỡng chuyên nghiệp
                        </div>
                        <h1 className="mt-4 max-w-3xl text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
                            Xin chào, điều dưỡng CareMate
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                            Theo dõi ca chăm sóc, lịch rảnh và thu nhập trong một bảng điều khiển gọn gàng.
                        </p>
                        <div data-tour="nurse-overview-actions" className="mt-5 flex flex-wrap gap-3">
                            <Link to="/nurse/schedule" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#10B981] px-5 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-600">Cập nhật lịch rảnh</Link>
                            <Link to="/nurse/bookings" className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">Danh sách lịch hẹn</Link>
                        </div>
                    </div>

                    <div className="border-t border-emerald-100 bg-slate-950 p-5 text-white lg:border-l lg:border-t-0">
                        <div className="mb-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/45">Tổng quan hôm nay</div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { label: 'Ca sắp tới', value: stats.upcoming, icon: CalendarIcon },
                                { label: 'Đang xử lý', value: stats.active, icon: SparklesIcon },
                                { label: 'Slot trống', value: stats.availableSlots, icon: ClockIcon },
                                { label: 'Thực nhận', value: stats.revenue.toLocaleString('vi-VN') + 'đ', icon: BanknotesIcon },
                            ].map((card) => (
                                <div key={card.label} className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
                                    <card.icon className="mb-2 h-4 w-4 text-[#10B981]" />
                                    <div className="text-[9px] font-black uppercase tracking-[0.1em] text-white/40">{card.label}</div>
                                    <div className="mt-1 text-base font-black text-white">{card.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section data-tour="nurse-overview-stats" className="grid gap-3 md:grid-cols-3">
                {[
                    { label: 'Doanh thu hoàn thành', value: stats.grossRevenue, helper: 'Tổng tiền khách đã trả' },
                    { label: 'Phí nền tảng 15%', value: stats.platformFee, helper: 'CareMate giữ lại' },
                    { label: 'Y tá thực nhận 85%', value: stats.revenue, helper: 'Số tiền dự kiến chi cho bạn' },
                ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.035)]">
                        <div className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">{item.label}</div>
                        <div className="mt-1.5 text-xl font-black tracking-tight text-slate-950">{item.value.toLocaleString('vi-VN')}đ</div>
                        <div className="mt-1 text-xs font-bold text-slate-500">{item.helper}</div>
                    </div>
                ))}
            </section>

            <section className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
                <div className="rounded-[1.15rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.045)] lg:p-6">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-slate-950">Thống kê trạng thái</h3>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">Phân bổ ca làm việc của bạn</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                            <ChartPieIcon className="h-5 w-5 text-[#10B981]" />
                        </div>
                    </div>
                    <div className="relative h-[240px]">
                        <Doughnut 
                            data={{
                                labels: statusSummary.map(([status]) => bookingLabels[status] ?? status),
                                datasets: [{
                                    data: statusSummary.map(([, count]) => count),
                                    backgroundColor: ['#10B981', '#059669', '#34D399', '#A7F3D0', '#ECFDF5', '#064E3B'],
                                    borderWidth: 0,
                                    hoverOffset: 15
                                }],
                            }}
                            options={{
                                maintainAspectRatio: false,
                                cutout: '75%',
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            usePointStyle: true,
                                            padding: 30,
                                            font: { weight: 'bold', size: 12 }
                                        }
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                <div className="rounded-[1.15rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.045)] lg:p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-slate-950">Ca chăm sóc sắp tới</h3>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">Ưu tiên thực hiện tiếp theo</p>
                        </div>
                        <Link to="/nurse/bookings" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#10B981]">
                            Xem tất cả
                            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-white transition-all">
                                <ArrowRightIcon className="h-4 w-4" />
                            </div>
                        </Link>
                    </div>
                    
                    <div className="space-y-3">
                        {nextBookings.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                                <CalendarIcon className="mx-auto mb-4 h-10 w-10 text-slate-200" />
                                <p className="text-sm font-bold text-slate-400">Bạn chưa có ca làm việc nào sắp tới.</p>
                            </div>
                        ) : (
                            nextBookings.map((booking) => (
                                <div key={booking.id} className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-100 hover:bg-white hover:shadow-xl hover:shadow-emerald-600/5">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#10B981] shadow-sm">
                                                <UserIcon className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate text-base font-black tracking-tight text-slate-950">{booking.serviceName}</div>
                                                <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                                                    <ClockIcon className="h-4 w-4 text-[#10B981]" />
                                                    {new Date(booking.startTime).toLocaleString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`w-fit rounded-full border border-slate-100 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${
                                            booking.status === 'confirmed' ? 'text-[#10B981]' : 'text-slate-400'
                                        }`}>
                                            {bookingLabels[booking.status] ?? booking.status}
                                        </div>
                                    </div>
                                    <div className="mt-4 border-t border-slate-100 pt-4 text-xs font-medium italic leading-relaxed text-slate-500">
                                        "{booking.notes || 'Không có ghi chú thêm từ khách hàng.'}"
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default NurseWorkspacePage;
