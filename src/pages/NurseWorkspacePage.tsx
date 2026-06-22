import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import caremateApi from '../api/caremateApi';
import type { AvailabilitySlotDto, BookingDetailDto, NurseRatingDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';
import { 
    CalendarIcon, 
    ClockIcon, 
    UserIcon, 
    ArrowRightIcon, 
    ChartPieIcon, 
    SparklesIcon,
    BanknotesIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import NursePendingApproval from '../components/nurse/NursePendingApproval';
import { getPlatformFee, getStatusLabel } from '../constants/booking';
import { useTranslation } from 'react-i18next';

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, LinearScale, LineElement, PointElement, Legend, Tooltip);

const getNursePayout = (booking: BookingDetailDto) =>
    booking.nursePayoutAmount ?? booking.totalPrice - getPlatformFee(booking.totalPrice);

const NurseWorkspacePage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<BookingDetailDto[]>([]);
    const [slots, setSlots] = useState<AvailabilitySlotDto[]>([]);
    const [rating, setRating] = useState<NurseRatingDto | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const uid = user?.userId ? Number(user.userId) : 0;
                const [bookingData, slotData, ratingData] = await Promise.all([
                    caremateApi.getMyNurseBookings(),
                    caremateApi.getMyAvailability(),
                    uid > 0 ? caremateApi.getMyNurseRating(uid).catch(() => null) : Promise.resolve(null),
                ]);
                setBookings(bookingData);
                setSlots(slotData);
                setRating(ratingData);
            } catch {
                showToast(t('nurseWorkspace.toastError'), 'error');
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [showToast, user?.userId]);

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

    const serviceSummary = useMemo(() => {
        const map = new Map<string, number>();
        bookings.forEach((booking) => {
            const name = booking.serviceName || 'Unknown';
            map.set(name, (map.get(name) ?? 0) + 1);
        });
        return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    }, [bookings]);

    const monthlyRevenue = useMemo(() => {
        const now = new Date();
        const revenueMap = new Map<string, number>();
        const active = bookings.filter((item) => item.status === 'confirmed' || item.status === 'in_progress' || item.status === 'completed');
        active.forEach((booking) => {
            const d = new Date(booking.startTime);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            revenueMap.set(key, (revenueMap.get(key) ?? 0) + (booking.nursePayoutAmount ?? booking.totalPrice - getPlatformFee(booking.totalPrice)));
        });
        const months: [string, number][] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months.push([key, revenueMap.get(key) ?? 0]);
        }
        return months;
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
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t('nurseWorkspace.loading')}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_18px_60px_rgba(15,118,110,0.08)]">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="p-5 sm:p-6 lg:p-7">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-700">
                            {t('nurseWorkspace.badge')}
                        </div>
                        <h1 className="mt-4 max-w-3xl text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
                            {t('nurseWorkspace.title')}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                            {t('nurseWorkspace.subtitle')}
                        </p>
                        <div data-tour="nurse-overview-actions" className="mt-5 flex flex-wrap gap-3">
                            <Link to="/nurse/schedule" className="inline-flex h-10 items-center justify-center rounded-xl bg-[#10B981] px-5 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-600">{t('nurseWorkspace.btnSchedule')}</Link>
                            <Link to="/nurse/bookings" className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">{t('nurseWorkspace.btnBookings')}</Link>
                        </div>
                    </div>

                    <div className="border-t border-emerald-100 bg-slate-950 p-5 text-white lg:border-l lg:border-t-0">
                        <div className="mb-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/45">{t('nurseWorkspace.todaySummary')}</div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { label: t('nurseWorkspace.upcoming'), value: stats.upcoming, icon: CalendarIcon },
                                { label: t('nurseWorkspace.active'), value: stats.active, icon: SparklesIcon },
                                { label: t('nurseWorkspace.availableSlots'), value: stats.availableSlots, icon: ClockIcon },
                                { label: t('nurseWorkspace.revenue'), value: stats.revenue.toLocaleString('vi-VN') + 'đ', icon: BanknotesIcon },
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
                    { label: t('nurseWorkspace.grossRevenue'), value: stats.grossRevenue, helper: t('nurseWorkspace.grossHelper') },
                    { label: t('nurseWorkspace.platformFee'), value: stats.platformFee, helper: t('nurseWorkspace.feeHelper') },
                    { label: t('nurseWorkspace.netRevenue'), value: stats.revenue, helper: t('nurseWorkspace.netHelper') },
                ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.035)]">
                        <div className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">{item.label}</div>
                        <div className="mt-1.5 text-xl font-black tracking-tight text-slate-950">{item.value.toLocaleString('vi-VN')}đ</div>
                        <div className="mt-1 text-xs font-bold text-slate-500">{item.helper}</div>
                    </div>
                ))}
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.045)]">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">{t('nurseWorkspace.statusStats')}</div>
                        <ChartPieIcon className="h-4 w-4 text-[#10B981]" />
                    </div>
                    <div className="relative h-[170px]">
                        <Doughnut 
                            data={{
                                labels: statusSummary.map(([status]) => getStatusLabel(t, status)),
                                datasets: [{
                                    data: statusSummary.map(([, count]) => count),
                                    backgroundColor: ['#10B981', '#059669', '#34D399', '#A7F3D0', '#ECFDF5', '#064E3B'],
                                    borderWidth: 0,
                                    hoverOffset: 10
                                }],
                            }}
                            options={{
                                maintainAspectRatio: false,
                                cutout: '72%',
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: { usePointStyle: true, padding: 14, font: { weight: 'bold', size: 10 } }
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.045)]">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">{t('nurseWorkspace.serviceDistTitle')}</div>
                        <ChartPieIcon className="h-4 w-4 text-[#10B981]" />
                    </div>
                    <div className="relative h-[170px]">
                        {serviceSummary.length > 0 ? (
                            <Doughnut
                                data={{
                                    labels: serviceSummary.map(([name]) => name),
                                    datasets: [{
                                        data: serviceSummary.map(([, count]) => count),
                                        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1'],
                                        borderWidth: 0,
                                        hoverOffset: 10,
                                    }],
                                }}
                                options={{
                                    maintainAspectRatio: false,
                                    cutout: '72%',
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: { usePointStyle: true, padding: 14, font: { weight: 'bold', size: 10 } },
                                        },
                                    },
                                }}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs font-bold text-slate-300">{t('nurseWorkspace.noServiceData')}</div>
                        )}
                    </div>
                </div>

                {rating && (
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.045)]">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">{t('nurseWorkspace.ratingTitle')}</div>
                            <div className="flex items-center gap-1 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1">
                                <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                                <span className="text-xs font-black text-slate-900">{rating.averageRating.toFixed(1)}</span>
                                <span className="text-[9px] font-bold text-slate-400">({rating.totalReviews})</span>
                            </div>
                        </div>
                        <div className="h-[170px]">
                            <Bar
                                data={{
                                    labels: ['1', '2', '3', '4', '5'],
                                    datasets: [{
                                        label: t('nurseWorkspace.ratingBarLabel'),
                                        data: [
                                            rating.ratingDistribution[1] ?? 0,
                                            rating.ratingDistribution[2] ?? 0,
                                            rating.ratingDistribution[3] ?? 0,
                                            rating.ratingDistribution[4] ?? 0,
                                            rating.ratingDistribution[5] ?? 0,
                                        ],
                                        backgroundColor: ['#F43F5E', '#F97316', '#EAB308', '#22C55E', '#10B981'],
                                        borderRadius: 6,
                                        borderSkipped: false,
                                    }],
                                }}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: { stepSize: 1, font: { weight: 'bold', size: 9 } },
                                            grid: { display: false },
                                        },
                                        x: {
                                            ticks: {
                                                font: { weight: 'bold', size: 10 },
                                                callback(_value, index) { return '★'.repeat(index + 1); },
                                            },
                                            grid: { display: false },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                )}
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.045)] lg:p-6">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-slate-950">{t('nurseWorkspace.monthlyRevenueTitle')}</h3>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">{t('nurseWorkspace.monthlyRevenueSubtitle')}</p>
                        </div>
                    </div>
                    <div className="h-[260px]">
                        {monthlyRevenue.length > 0 ? (
                            <Line
                                data={{
                                    labels: monthlyRevenue.map(([month]) => month),
                                    datasets: [{
                                        label: t('nurseWorkspace.monthlyRevenueLabel'),
                                        data: monthlyRevenue.map(([, rev]) => rev),
                                        borderColor: '#059669',
                                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                        fill: true,
                                        tension: 0.3,
                                        pointBackgroundColor: '#059669',
                                        pointBorderColor: '#fff',
                                        pointBorderWidth: 2,
                                        pointRadius: 5,
                                        pointHoverRadius: 7,
                                        borderWidth: 3,
                                    }],
                                }}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                font: { weight: 'bold', size: 10 },
                                                callback(value) {
                                                    return Number(value).toLocaleString('vi-VN') + 'đ';
                                                },
                                            },
                                            grid: { color: '#F1F5F9' },
                                        },
                                        x: {
                                            ticks: { font: { weight: 'bold', size: 11 } },
                                            grid: { display: false },
                                        },
                                    },
                                }}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm font-bold text-slate-300">{t('nurseWorkspace.noRevenueData')}</div>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.045)] lg:p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-slate-950">{t('nurseWorkspace.upcomingBookings')}</h3>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">{t('nurseWorkspace.upcomingSubtitle')}</p>
                        </div>
                        <Link to="/nurse/bookings" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#10B981] shrink-0">
                            {t('nurseWorkspace.viewAll')}
                            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-white transition-all">
                                <ArrowRightIcon className="h-4 w-4" />
                            </div>
                        </Link>
                    </div>
                    
                    <div className="space-y-3 max-h-[260px] overflow-y-auto">
                        {nextBookings.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                                <CalendarIcon className="mx-auto mb-3 h-8 w-8 text-slate-200" />
                                <p className="text-sm font-bold text-slate-400">{t('nurseWorkspace.emptyBookings')}</p>
                            </div>
                        ) : (
                            nextBookings.map((booking) => (
                                <div key={booking.id} className="group rounded-2xl border border-slate-100 bg-slate-50 p-3.5 transition hover:border-emerald-100 hover:bg-white hover:shadow-xl hover:shadow-emerald-600/5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#10B981] shadow-sm">
                                            <UserIcon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-black tracking-tight text-slate-950">{booking.serviceName}</div>
                                            <div className="mt-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                                                <ClockIcon className="h-3 w-3 text-[#10B981]" />
                                                {new Date(booking.startTime).toLocaleString('vi-VN')}
                                            </div>
                                        </div>
                                        <div className={`shrink-0 rounded-full border border-slate-100 bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${
                                            booking.status === 'confirmed' ? 'text-[#10B981]' : 'text-slate-400'
                                        }`}>
                                            {getStatusLabel(t, booking.status)}
                                        </div>
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
