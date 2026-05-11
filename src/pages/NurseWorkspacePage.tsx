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

    if (user?.role !== 'nurse_confirmed') {
        return <NursePendingApproval />;
    }
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
        const availableSlots = slots.filter((item) => !item.isBooked).length;
        const revenue = bookings
            .filter((item) => item.status === 'completed')
            .reduce((acc, curr) => acc + curr.totalPrice, 0);

        return { upcoming, active, availableSlots, revenue };
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
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="bg-slate-900 rounded-xl p-12 relative overflow-hidden shadow-2xl shadow-slate-900/10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] -mr-48 -mt-48 rounded-full"></div>
                <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12 items-center">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                            Kênh điều dưỡng chuyên nghiệp
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
                            Xin chào, <span className="text-[#10B981]">Điều dưỡng CareMate</span>
                        </h1>
                        <p className="mt-6 text-lg font-medium text-white/50 leading-relaxed">
                            Quản lý lịch trình, theo dõi các ca chăm sóc và kiểm soát thu nhập của bạn một cách khoa học.
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link to="/nurse/schedule" className="bg-[#10B981] text-white px-10 py-5 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-600/30 hover:scale-105 transition-all">Cập nhật lịch rảnh</Link>
                            <Link to="/nurse/bookings" className="px-10 py-5 rounded-lg bg-white/5 text-white border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Danh sách lịch hẹn</Link>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                        {[
                            { label: 'Ca sắp tới', value: stats.upcoming, icon: CalendarIcon, color: 'text-[#10B981]' },
                            { label: 'Đang xử lý', value: stats.active, icon: SparklesIcon, color: 'text-[#10B981]' },
                            { label: 'Slot trống', value: stats.availableSlots, icon: ClockIcon, color: 'text-[#10B981]' },
                            { label: 'Thu nhập', value: stats.revenue.toLocaleString('vi-VN') + 'đ', icon: BanknotesIcon, color: 'text-[#10B981]' },
                        ].map((card) => (
                            <div key={card.label} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 min-w-[180px]">
                                <card.icon className={`h-6 w-6 ${card.color} mb-4`} />
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">{card.label}</div>
                                <div className="text-xl font-black text-white">{card.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dashboard Content */}
            <section className="grid gap-8 lg:grid-cols-2">
                {/* Stats Chart */}
                <div className="bg-white rounded-xl p-10 border border-slate-50 shadow-xl shadow-slate-200/20">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Thống kê trạng thái</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Phân bổ ca làm việc của bạn</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <ChartPieIcon className="h-6 w-6 text-[#10B981]" />
                        </div>
                    </div>
                    <div className="h-[320px] relative">
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

                {/* Next Bookings */}
                <div className="bg-white rounded-xl p-10 border border-slate-50 shadow-xl shadow-slate-200/20">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ca chăm sóc sắp tới</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ưu tiên thực hiện tiếp theo</p>
                        </div>
                        <Link to="/nurse/bookings" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#10B981]">
                            Xem tất cả
                            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-white transition-all">
                                <ArrowRightIcon className="h-4 w-4" />
                            </div>
                        </Link>
                    </div>
                    
                    <div className="space-y-4">
                        {nextBookings.length === 0 ? (
                            <div className="py-20 text-center rounded-xl bg-slate-50 border-2 border-dashed border-slate-100">
                                <CalendarIcon className="h-12 w-12 mx-auto text-slate-200 mb-6" />
                                <p className="text-sm font-bold text-slate-400">Bạn chưa có ca làm việc nào sắp tới.</p>
                            </div>
                        ) : (
                            nextBookings.map((booking) => (
                                <div key={booking.id} className="group rounded-xl bg-slate-50 p-6 border border-transparent hover:border-emerald-100 hover:bg-white hover:shadow-2xl hover:shadow-emerald-600/5 transition-all duration-500">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#10B981]">
                                                <UserIcon className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <div className="text-lg font-black text-slate-900 tracking-tight">{booking.serviceName}</div>
                                                <div className="flex items-center gap-3 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <ClockIcon className="h-4 w-4 text-[#10B981]" />
                                                    {new Date(booking.startTime).toLocaleString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-slate-100 ${
                                            booking.status === 'confirmed' ? 'text-[#10B981]' : 'text-slate-400'
                                        }`}>
                                            {bookingLabels[booking.status] ?? booking.status}
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-slate-100/50 text-xs font-medium text-slate-500 leading-relaxed italic">
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
