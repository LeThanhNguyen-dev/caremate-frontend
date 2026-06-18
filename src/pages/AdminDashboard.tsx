import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import caremateApi from '../api/caremateApi';
import type { AdminBookingSummaryDto, AdminDashboardDto, AdminUserDto, NurseProfileDetailDto } from '../api/frontend-api-contract';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    UsersIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    ExclamationCircleIcon,
    ArrowRightIcon,
    CheckBadgeIcon,
    ClockIcon,
    BanknotesIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip
);

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
});

const dateLabelFormatter = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit'
});

const statusLabels: Record<string, string> = {
    pending_confirm: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    in_progress: 'Đang chăm sóc',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    rejected: 'Từ chối'
};

const roleLabels: Record<string, string> = {
    customer: 'Khách hàng',
    nurse_unconfirmed: 'Điều dưỡng chờ duyệt',
    nurse_confirmed: 'Điều dưỡng đã duyệt',
    nurse: 'Điều dưỡng'
};

const getLastSevenDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - index));
        return date;
    });
};

const isSameDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

const AdminDashboard = () => {
    const [summary, setSummary] = useState<AdminDashboardDto | null>(null);
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [pendingNurses, setPendingNurses] = useState<NurseProfileDetailDto[]>([]);
    const [bookings, setBookings] = useState<AdminBookingSummaryDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [dashboard, u, n, b] = await Promise.all([
                    caremateApi.getAdminDashboard(),
                    caremateApi.getAdminUsers(),
                    caremateApi.getPendingNurses(),
                    caremateApi.getAdminBookings()
                ]);
                setSummary(dashboard);
                setUsers(u);
                setPendingNurses(n);
                setBookings(b);
            } catch (err) {
                console.error('Failed to load admin dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        void loadData();
    }, []);

    const stats = useMemo(() => ([
        { label: 'Tổng người dùng', value: summary?.totalUsers ?? users.length, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Điều dưỡng đã duyệt', value: users.filter(u => u.role === 'nurse_confirmed').length, icon: CheckBadgeIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Hồ sơ chờ duyệt', value: summary?.pendingNurseApprovals ?? pendingNurses.length, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Lịch hẹn mới', value: summary?.pendingBookings ?? bookings.filter(b => b.status === 'pending_confirm').length, icon: ClipboardDocumentListIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ]), [summary, users, pendingNurses, bookings]);

    const chartData = useMemo(() => {
        const days = getLastSevenDays();
        const bookingsByDay = days.map(day =>
            bookings.filter(booking => isSameDay(new Date(booking.startTime), day)).length
        );
        const revenueByDay = days.map(day =>
            bookings
                .filter(booking => booking.status === 'completed' && isSameDay(new Date(booking.startTime), day))
                .reduce((sum, booking) => sum + booking.totalPrice, 0)
        );

        const statuses = Object.entries(
            bookings.reduce<Record<string, number>>((acc, booking) => {
                acc[booking.status] = (acc[booking.status] ?? 0) + 1;
                return acc;
            }, {})
        );

        const roles = Object.entries(
            users.reduce<Record<string, number>>((acc, user) => {
                acc[user.role] = (acc[user.role] ?? 0) + 1;
                return acc;
            }, {})
        );

        return {
            dayLabels: days.map(day => dateLabelFormatter.format(day)),
            bookingsByDay,
            revenueByDay,
            statusLabels: statuses.map(([status]) => statusLabels[status] ?? status),
            statusValues: statuses.map(([, value]) => value),
            roleLabels: roles.map(([role]) => roleLabels[role] ?? role),
            roleValues: roles.map(([, value]) => value),
        };
    }, [users, bookings]);

    const totalRevenue = useMemo(() =>
        bookings
            .filter(booking => booking.status === 'completed')
            .reduce((sum, booking) => sum + booking.totalPrice, 0),
        [bookings]
    );

    const dayOfWeekData = useMemo(() => {
        const labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const values = Array(7).fill(0);
        bookings.forEach(b => { const d = new Date(b.startTime); values[d.getDay()]++; });
        return { labels, values };
    }, [bookings]);

    const nurseLeaderboard = useMemo(() =>
        users
            .filter(u => (u.role === 'nurse' || u.role === 'nurse_confirmed') && (u.bookingCount ?? 0) > 0)
            .sort((a, b) => (b.bookingCount ?? 0) - (a.bookingCount ?? 0))
            .slice(0, 5),
        [users]
    );

    const funnelData = useMemo(() => {
        const total = bookings.length;
        const completed = bookings.filter(b => b.status === 'completed').length;
        const cancelled = bookings.filter(b => b.status === 'cancelled').length;
        const inProgress = bookings.filter(b => b.status === 'in_progress').length;
        const confirmed = bookings.filter(b => b.status === 'confirmed').length;
        const pending = bookings.filter(b => b.status === 'pending_confirm').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, cancelled, inProgress, confirmed, pending, completionRate };
    }, [bookings]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                padding: 12,
                titleFont: { weight: 800 },
                bodyFont: { weight: 700 }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { weight: 800 } }
            },
            y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9' },
                ticks: { precision: 0, color: '#94a3b8', font: { weight: 800 } }
            }
        }
    } as const;

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    boxWidth: 10,
                    boxHeight: 10,
                    color: '#475569',
                    font: { weight: 800 }
                }
            },
            tooltip: {
                backgroundColor: '#0f172a',
                padding: 12,
                titleFont: { weight: 800 },
                bodyFont: { weight: 700 }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#3B82F6] border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang khởi tạo hệ quản trị...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <section className="lg:col-span-1 bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20 flex flex-col justify-center">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-2">Tỷ lệ hoàn thành</div>
                    <div className="text-5xl font-black text-slate-900 tracking-tight">{funnelData.completionRate}%</div>
                    <div className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        {funnelData.completed}/{funnelData.total} hoàn thành
                    </div>
                    <div className="mt-6 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${funnelData.completionRate}%` }}></div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-lg font-black text-slate-900">{funnelData.pending + funnelData.confirmed + funnelData.inProgress}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đang xử lý</div>
                        </div>
                        <div>
                            <div className="text-lg font-black text-slate-900">{funnelData.cancelled}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đã hủy</div>
                        </div>
                    </div>
                </section>

                <section className="lg:col-span-1 bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20">
                    <div className="mb-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 mb-2">Phân bổ</div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Thứ trong tuần</h3>
                    </div>
                    <div className="h-64">
                        <Bar
                            options={{
                                ...chartOptions,
                                indexAxis: 'y' as const,
                                scales: {
                                    ...chartOptions.scales,
                                    y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { weight: 800 } } }
                                }
                            }}
                            data={{
                                labels: dayOfWeekData.labels,
                                datasets: [{ label: 'Lịch hẹn', data: dayOfWeekData.values, backgroundColor: '#6366f1', borderRadius: 6, barThickness: 26 }]
                            }}
                        />
                    </div>
                </section>

                <section className="lg:col-span-2 bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20">
                    <div className="mb-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500 mb-2">Xếp hạng</div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Điều dưỡng năng suất nhất</h3>
                    </div>
                    <div className="space-y-4">
                        {nurseLeaderboard.length > 0 ? (
                            nurseLeaderboard.map((nurse, idx) => (
                                <div key={nurse.userId} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center font-black text-slate-900 shadow-sm">{idx + 1}</div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900">{nurse.fullName}</div>
                                            <div className="text-[10px] font-bold text-slate-400">{nurse.bookingCount} lượt</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {nurse.averageRating != null && (
                                            <span className="text-sm font-black text-amber-500">{nurse.averageRating.toFixed(1)}</span>
                                        )}
                                        <span className="text-[10px] font-bold text-slate-400">sao</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center rounded-xl bg-slate-50">
                                <p className="text-sm font-bold text-slate-400">Chưa có dữ liệu điều dưỡng.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20 hover:shadow-2xl transition-all"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className={`h-14 w-14 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`h-7 w-7 ${stat.color}`} />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-slate-300">
                                <ChartBarIcon className="h-3 w-3" />
                                Thực tế
                            </div>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
                        <div className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <section className="xl:col-span-2 bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 mb-2">7 ngày gần nhất</div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Lịch hẹn theo ngày</h2>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-5 py-3 text-right">
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Doanh thu hoàn thành</div>
                            <div className="text-lg font-black text-slate-900">{moneyFormatter.format(totalRevenue)}</div>
                        </div>
                    </div>
                    <div className="h-80">
                        <Line
                            options={chartOptions}
                            data={{
                                labels: chartData.dayLabels,
                                datasets: [
                                    {
                                        label: 'Lịch hẹn',
                                        data: chartData.bookingsByDay,
                                        borderColor: '#2563eb',
                                        backgroundColor: 'rgba(37, 99, 235, 0.12)',
                                        fill: true,
                                        tension: 0.35,
                                        pointRadius: 4,
                                        pointHoverRadius: 6,
                                        pointBackgroundColor: '#2563eb'
                                    }
                                ]
                            }}
                        />
                    </div>
                </section>

                <section className="bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20">
                    <div className="mb-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-2">Người dùng</div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cơ cấu tài khoản</h2>
                    </div>
                    <div className="h-80">
                        <Doughnut
                            options={doughnutOptions}
                            data={{
                                labels: chartData.roleLabels,
                                datasets: [
                                    {
                                        data: chartData.roleValues,
                                        backgroundColor: ['#2563eb', '#f59e0b', '#10b981', '#64748b'],
                                        borderWidth: 0
                                    }
                                ]
                            }}
                        />
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <section className="bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20">
                    <div className="mb-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500 mb-2">Lịch hẹn</div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Trạng thái xử lý</h2>
                    </div>
                    <div className="h-80">
                        <Doughnut
                            options={doughnutOptions}
                            data={{
                                labels: chartData.statusLabels,
                                datasets: [
                                    {
                                        data: chartData.statusValues,
                                        backgroundColor: ['#f59e0b', '#2563eb', '#14b8a6', '#10b981', '#ef4444', '#64748b'],
                                        borderWidth: 0
                                    }
                                ]
                            }}
                        />
                    </div>
                </section>

                <section className="xl:col-span-2 bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20">
                    <div className="mb-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Doanh thu</div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Doanh thu hoàn thành theo ngày</h2>
                    </div>
                    <div className="h-80">
                        <Bar
                            options={{
                                ...chartOptions,
                                plugins: {
                                    ...chartOptions.plugins,
                                    tooltip: {
                                        ...chartOptions.plugins.tooltip,
                                        callbacks: {
                                            label: (context) => moneyFormatter.format(Number(context.raw ?? 0))
                                        }
                                    }
                                }
                            }}
                            data={{
                                labels: chartData.dayLabels,
                                datasets: [
                                    {
                                        label: 'Doanh thu',
                                        data: chartData.revenueByDay,
                                        backgroundColor: '#10b981',
                                        borderRadius: 8,
                                        barThickness: 26
                                    }
                                ]
                            }}
                        />
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section className="lg:col-span-2 bg-slate-900 rounded-xl p-10 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-[9px] font-black uppercase tracking-[0.2em] mb-8">Hành động cần ưu tiên</div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                            <h2 className="text-4xl font-black text-white tracking-tight leading-none">Xét duyệt hồ sơ điều dưỡng</h2>
                            <Link to="/admin/pending-nurses" className="bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all">Xem tất cả</Link>
                        </div>

                        <div className="space-y-4">
                            {pendingNurses.length === 0 ? (
                                <div className="py-20 text-center rounded-xl bg-white/5 border border-white/10">
                                    <CheckBadgeIcon className="h-12 w-12 mx-auto text-white/20 mb-4" />
                                    <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Không có hồ sơ nào đang chờ</p>
                                </div>
                            ) : (
                                pendingNurses.slice(0, 3).map((nurse) => (
                                    <div key={nurse.userId} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex items-center justify-between hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="h-14 w-14 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xl uppercase">
                                                {nurse.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-lg font-black text-white tracking-tight">{nurse.fullName}</div>
                                                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Đang chờ xác minh danh tính và bằng cấp chuyên môn</div>
                                            </div>
                                        </div>
                                        <Link to={`/admin/nurses/${nurse.userId}`} className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-[#3B82F6] group-hover:text-white transition-all">
                                            <ArrowRightIcon className="h-5 w-5" />
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cảnh báo hệ thống</h3>
                        <ExclamationCircleIcon className="h-6 w-6 text-rose-500" />
                    </div>

                    <div className="space-y-4">
                        <div className="p-6 rounded-xl bg-rose-50 border border-rose-100">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
                                    <ExclamationCircleIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-rose-900 leading-tight">Khiếu nại chưa xử lý</div>
                                    <div className="text-[10px] font-medium text-rose-500 mt-1 uppercase tracking-widest">Hiện có {summary?.openDisputes ?? 0} trường hợp cần giải quyết.</div>
                                    <Link to="/admin/reports" className="mt-3 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:underline inline-block">Xử lý ngay</Link>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-300 flex items-center justify-center shrink-0">
                                    <BanknotesIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-900 leading-tight">Giao dịch thanh toán</div>
                                    <div className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-widest">Doanh thu hoàn thành: {moneyFormatter.format(totalRevenue)}.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
