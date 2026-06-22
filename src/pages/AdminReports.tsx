import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Doughnut } from 'react-chartjs-2';
import caremateApi from '../api/caremateApi';
import type { Dispute } from '../api/frontend-api-contract';
import {
    ExclamationTriangleIcon,
    CheckBadgeIcon,
    XCircleIcon,
    ChartPieIcon,
    ArrowPathIcon,
    ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useToast } from '../hooks/useToast';

ChartJS.register(ArcElement, Legend, Tooltip);

const AdminReports = () => {
    const { showToast } = useToast();
    const { t } = useTranslation();
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [adminNote, setAdminNote] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await caremateApi.getAdminDisputes();
            setDisputes(data);
        } catch {
            showToast(t('adminReports.loadError'), 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        void load();
    }, [load]);

    const disputeStats = useMemo(() => {
        const map = new Map<string, number>();
        disputes.forEach((item) => map.set(item.status, (map.get(item.status) ?? 0) + 1));
        return Array.from(map.entries());
    }, [disputes]);

    const resolve = async (id: number, status: 'resolved' | 'rejected') => {
        const note = adminNote[id] || (status === 'resolved' ? 'Đã giải quyết' : 'Từ chối giải quyết');
        try {
            await caremateApi.updateDispute(id, { status, adminNote: note });
            showToast(status === 'resolved' ? 'Đã giải quyết khiếu nại.' : 'Đã từ chối yêu cầu.', 'success');
            await load();
        } catch {
            showToast('Cập nhật thất bại.', 'error');
        }
    };

    const statusLabels: Record<string, string> = {
        open: 'Đang mở',
        resolved: 'Đã giải quyết',
        rejected: 'Đã từ chối',
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#3B82F6] border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang tải dữ liệu khiếu nại...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header Section */}
            <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="bg-slate-900 rounded-xl p-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -mr-48 -mt-48"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-[9px] font-black uppercase tracking-[0.2em] mb-6">
                            <ShieldExclamationIcon className="h-3.5 w-3.5" />
                            Trung tâm khiếu nại
                        </div>
                        <h2 className="text-4xl font-black text-white leading-tight">
                            Quản lý tranh chấp <br />& báo cáo hệ thống
                        </h2>
                        <p className="mt-6 max-w-2xl text-sm font-medium text-white/40 leading-relaxed">
                            Quản trị viên có thể xem ngay khiếu nại nào đang mở, trạng thái xử lý và cập nhật ghi chú trực tiếp trên từng trường hợp.
                        </p>
                        <div className="mt-8">
                            <button onClick={load} className="bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-2 active:scale-95">
                                <ArrowPathIcon className="h-4 w-4" />
                                Làm mới dữ liệu
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                    {[
                        { label: 'Tổng khiếu nại', value: disputes.length, icon: ExclamationTriangleIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Đang mở', value: disputes.filter((item) => item.status === 'open').length, icon: XCircleIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
                        { label: 'Đã xử lý', value: disputes.filter((item) => item.status === 'resolved').length, icon: CheckBadgeIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    ].map((item) => (
                        <div key={item.label} className="bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20 flex items-center gap-6">
                            <div className={`h-14 w-14 rounded-xl ${item.bg} flex items-center justify-center`}>
                                <item.icon className={`h-7 w-7 ${item.color}`} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                                <div className="mt-1 text-3xl font-black text-slate-900">{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Chart + Disputes Grid */}
            <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
                {/* Doughnut Chart */}
                <div className="bg-white rounded-xl p-10 border border-slate-50 shadow-xl shadow-slate-200/20">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Phân bổ tranh chấp</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tỷ trọng các trường hợp theo trạng thái</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                            <ChartPieIcon className="h-6 w-6 text-[#3B82F6]" />
                        </div>
                    </div>
                    <div className="h-[320px]">
                        {disputeStats.length > 0 ? (
                            <Doughnut
                                data={{
                                    labels: disputeStats.map(([status]) => statusLabels[status] ?? status),
                                    datasets: [{
                                        data: disputeStats.map(([, count]) => count),
                                        backgroundColor: ['#EF4444', '#10B981', '#94A3B8'],
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
                                                padding: 25,
                                                font: { weight: 'bold', size: 12 }
                                            }
                                        },
                                    },
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm font-bold text-slate-300">Chưa có dữ liệu</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dispute List */}
                <div className="space-y-4">
                    {disputes.length === 0 ? (
                        <div className="bg-white rounded-xl p-20 text-center border border-slate-50 shadow-xl shadow-slate-200/20">
                            <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-slate-200 mb-4" />
                            <p className="text-sm font-bold text-slate-400">Chưa có khiếu nại nào cần xử lý.</p>
                        </div>
                    ) : (
                        disputes.map((dispute) => (
                            <div key={dispute.id} className="bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20 hover:shadow-2xl transition-all">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Khiếu nại #{dispute.id} · Booking #{dispute.bookingId}
                                        </div>
                                        <div className="mt-3 text-2xl font-black text-slate-900 tracking-tight">{dispute.reason}</div>
                                        <div className="mt-2 text-xs font-bold text-slate-400">
                                            Tạo lúc {new Date(dispute.createdAt).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                    <div className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shrink-0 ${
                                        dispute.status === 'open' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-600 border border-slate-100'
                                    }`}>
                                        {statusLabels[dispute.status] ?? dispute.status}
                                    </div>
                                </div>

                                {dispute.status === 'open' ? (
                                    <div className="mt-6 rounded-xl bg-slate-50 p-6 border border-slate-100">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Ghi chú xử lý</label>
                                        <textarea
                                            className="w-full bg-white border border-slate-100 rounded-xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#3B82F6] transition-all"
                                            rows={3}
                                            value={adminNote[dispute.id] ?? ''}
                                            onChange={(event) => setAdminNote((prev) => ({ ...prev, [dispute.id]: event.target.value }))}
                                            placeholder="Mô tả hướng xử lý, bồi hoàn, cảnh báo y tá..."
                                        />
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <button
                                                onClick={() => void resolve(dispute.id, 'resolved')}
                                                className="bg-[#3B82F6] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all active:scale-95"
                                            >
                                                Đánh dấu đã giải quyết
                                            </button>
                                            <button
                                                onClick={() => void resolve(dispute.id, 'rejected')}
                                                className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                                            >
                                                Từ chối yêu cầu
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-6 rounded-xl bg-slate-50 p-6 border border-slate-100">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ghi chú quản trị viên</div>
                                        <div className="text-sm font-medium text-slate-600">{dispute.adminNote || 'Không có ghi chú.'}</div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminReports;
