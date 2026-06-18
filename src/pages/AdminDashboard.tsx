import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import caremateApi from '../api/caremateApi';
import type { AdminAiInsightResponse, AdminBookingSummaryDto, AdminDashboardDto, AdminUserDto, NurseProfileDetailDto } from '../api/frontend-api-contract';
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
    SparklesIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/useToast';

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

const aiUseCases = [
    {
        id: 'personalized_care_plan',
        title: 'Cá nhân hóa lộ trình chăm sóc',
        description: 'Dựa vào booking và dữ liệu sẵn có để đề xuất bước chăm sóc tiếp theo.',
        prompt: 'Hãy đánh giá booking này và đề xuất lộ trình chăm sóc tiếp theo phù hợp cho mẹ và bé.'
    },
    {
        id: 'health_summary',
        title: 'Miêu tả tình hình sức khỏe mẹ & bé',
        description: 'Tóm tắt nhanh tình trạng mẹ và bé để admin theo dõi và điều phối.',
        prompt: 'Hãy tóm tắt tình hình sức khỏe mẹ và bé từ dữ liệu hiện có, nêu rõ điểm cần theo dõi thêm.'
    },
    {
        id: 'service_optimization',
        title: 'Tối ưu hóa vận hành dịch vụ',
        description: 'Phân tích booking và doanh thu để gợi ý cách tối ưu vận hành.',
        prompt: 'Hãy phân tích vận hành 30 ngày gần nhất và đề xuất các hành động tối ưu hóa dịch vụ.'
    }
] as const;

const AdminDashboard = () => {
    const { showToast } = useToast();
    const [summary, setSummary] = useState<AdminDashboardDto | null>(null);
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [pendingNurses, setPendingNurses] = useState<NurseProfileDetailDto[]>([]);
    const [bookings, setBookings] = useState<AdminBookingSummaryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUseCase, setSelectedUseCase] = useState<(typeof aiUseCases)[number]['id']>('service_optimization');
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    const [aiPrompt, setAiPrompt] = useState<string>(aiUseCases[2].prompt);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiInsight, setAiInsight] = useState<AdminAiInsightResponse | null>(null);

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

    useEffect(() => {
        if (!selectedBookingId && bookings.length > 0) {
            const latestBooking = [...bookings].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];
            setSelectedBookingId(latestBooking?.id ?? null);
        }
    }, [bookings, selectedBookingId]);

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

    const selectedBooking = useMemo(() =>
        bookings.find((booking) => booking.id === selectedBookingId) ?? null,
        [bookings, selectedBookingId]
    );

    const recentBookingOptions = useMemo(() =>
        [...bookings]
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, 8),
        [bookings]
    );

    const runAiInsight = async () => {
        if (!aiPrompt.trim()) {
            showToast('Hãy nhập yêu cầu cho AI trước khi phân tích.', 'error');
            return;
        }

        if (selectedUseCase !== 'service_optimization' && !selectedBooking) {
            showToast('Hãy chọn một booking để AI có ngữ cảnh phân tích.', 'error');
            return;
        }

        try {
            setAiLoading(true);
            const result = await caremateApi.generateAdminAiInsight({
                useCase: selectedUseCase,
                prompt: aiPrompt.trim(),
                bookingId: selectedUseCase === 'personalized_care_plan' ? selectedBooking?.id ?? null : null,
                customerId: selectedUseCase !== 'service_optimization' ? selectedBooking?.customerId ?? null : null,
                dateRange: selectedUseCase === 'service_optimization'
                    ? {
                        from: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
                        to: new Date().toISOString()
                    }
                    : null
            });
            setAiInsight(result);
            showToast('Đã tạo insight AI cho admin.', 'success');
        } catch (error: any) {
            console.error('Failed to generate admin AI insight', error);
            setAiInsight(null);
            showToast(error?.response?.data?.message || 'Không thể tạo insight AI lúc này.', 'error');
        } finally {
            setAiLoading(false);
        }
    };

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
            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-[linear-gradient(135deg,#0f172a_0%,#102f56_55%,#0ea5a4_140%)] p-8 shadow-2xl shadow-slate-300/30">
                <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100">
                            <SparklesIcon className="h-4 w-4" />
                            AI Operations Studio
                        </div>
                        <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight text-white md:text-4xl">
                            Phân tích vận hành CareMate bằng 3 luồng AI dành cho admin.
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-200/80">
                            Chọn đúng use case, thêm yêu cầu của bạn và để hệ thống tự ghép booking, khách hàng hoặc dữ liệu vận hành liên quan trước khi tạo insight.
                        </p>

                        <div className="mt-7 grid gap-3 md:grid-cols-3">
                            {aiUseCases.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedUseCase(item.id);
                                        setAiPrompt(item.prompt);
                                    }}
                                    className={`rounded-2xl border p-4 text-left transition ${selectedUseCase === item.id ? 'border-cyan-300 bg-white text-slate-950 shadow-xl' : 'border-white/10 bg-white/8 text-white hover:bg-white/12'}`}
                                >
                                    <div className="text-sm font-black leading-5">{item.title}</div>
                                    <div className={`mt-2 text-xs font-semibold leading-5 ${selectedUseCase === item.id ? 'text-slate-500' : 'text-slate-200/70'}`}>
                                        {item.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-2xl shadow-slate-950/20">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-600">Yêu cầu phân tích</div>
                                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Tạo insight ngay</h3>
                            </div>
                            <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {selectedUseCase.replaceAll('_', ' ')}
                            </div>
                        </div>

                        <div className="mt-5 space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Booking ngữ cảnh</span>
                                <select
                                    value={selectedBookingId ?? ''}
                                    onChange={(event) => setSelectedBookingId(event.target.value ? Number(event.target.value) : null)}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                                >
                                    <option value="">Chọn booking gần đây</option>
                                    {recentBookingOptions.map((booking) => (
                                        <option key={booking.id} value={booking.id}>
                                            #{booking.id} • {statusLabels[booking.status] ?? booking.status} • {new Date(booking.startTime).toLocaleDateString('vi-VN')}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Prompt cho AI</span>
                                <textarea
                                    value={aiPrompt}
                                    onChange={(event) => setAiPrompt(event.target.value)}
                                    rows={5}
                                    placeholder="Ví dụ: phân tích vì sao tỷ lệ hoàn thành booking tuần này giảm và nên xử lý thế nào."
                                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                                />
                            </label>

                            {selectedBooking && (
                                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs font-bold leading-6 text-slate-600">
                                    Ngữ cảnh hiện tại: booking #{selectedBooking.id}, khách hàng #{selectedBooking.customerId}, trạng thái {statusLabels[selectedBooking.status] ?? selectedBooking.status}, giá trị {moneyFormatter.format(selectedBooking.totalPrice)}.
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => void runAiInsight()}
                                disabled={aiLoading}
                                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-cyan-600 disabled:opacity-50"
                            >
                                {aiLoading ? 'Đang tạo insight...' : 'Tạo insight cho admin'}
                            </button>
                        </div>
                    </div>
                </div>

                {aiInsight && (
                    <div className="mt-8 rounded-2xl border border-white/10 bg-white/95 p-6 shadow-2xl shadow-slate-950/20">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-600">Kết quả AI</div>
                                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{aiInsight.title}</h3>
                                <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">{aiInsight.summary}</p>
                            </div>
                            <div className="space-y-2 text-right">
                                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{aiInsight.aiModel ?? 'rule_engine'}</div>
                                <div className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${aiInsight.fallbackMode ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {aiInsight.fallbackMode ? 'Fallback mode' : 'AI parsed'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                            <div className="space-y-6">
                                <div>
                                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Metrics</div>
                                    <div className="mt-3 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                                        {aiInsight.metrics.map((metric) => (
                                            <div key={`${metric.label}-${metric.value}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{metric.label}</div>
                                                <div className="mt-2 text-2xl font-black tracking-tight text-slate-950">{metric.value}</div>
                                                {metric.note && <div className="mt-2 text-xs font-semibold leading-5 text-slate-500">{metric.note}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Liên kết dữ liệu</div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {aiInsight.relatedEntities.map((entity) => (
                                            <span key={`${entity.type}-${entity.id}`} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600">
                                                {entity.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Insights</div>
                                    <div className="mt-3 space-y-3">
                                        {aiInsight.insights.map((insight) => (
                                            <div key={insight} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700">
                                                {insight}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Hành động khuyến nghị</div>
                                    <div className="mt-3 space-y-3">
                                        {aiInsight.recommendedActions.map((action) => (
                                            <div key={`${action.label}-${action.priority}`} className="rounded-2xl bg-slate-950 px-4 py-4 text-white">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="text-sm font-black">{action.label}</div>
                                                    <div className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-100">
                                                        Priority {action.priority}
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-sm font-semibold leading-6 text-slate-200">{action.reason}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold leading-6 text-amber-800">
                            {aiInsight.disclaimer}
                        </div>
                    </div>
                )}
            </section>

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
