import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import caremateApi from '../api/caremateApi';
import type { AdminBookingSummaryDto, AdminUserDto, NurseProfileDetailDto } from '../api/frontend-api-contract';
import { 
    UsersIcon, 
    ClipboardDocumentListIcon, 
    ChartBarIcon,
    ExclamationCircleIcon,
    ArrowRightIcon,
    CheckBadgeIcon,
    ClockIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [pendingNurses, setPendingNurses] = useState<NurseProfileDetailDto[]>([]);
    const [bookings, setBookings] = useState<AdminBookingSummaryDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [u, n, b] = await Promise.all([
                    caremateApi.getAdminUsers(),
                    caremateApi.getPendingNurses(),
                    caremateApi.getAdminBookings()
                ]);
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
        { label: 'Tổng người dùng', value: users.length, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Điều dưỡng đã duyệt', value: users.filter(u => u.role === 'nurse_confirmed').length, icon: CheckBadgeIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Hồ sơ chờ duyệt', value: pendingNurses.length, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Lịch hẹn mới', value: bookings.filter(b => b.status === 'pending_confirm').length, icon: ClipboardDocumentListIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ]), [users, pendingNurses, bookings]);

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
        <div className="space-y-12">
            {/* Quick Stats Grid */}
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
                            <div className={`h-14 w-14 rounded-lg ${stat.bg} flex items-center justify-center`}>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Action Card */}
                <div className="lg:col-span-2">
                    <section className="bg-slate-900 rounded-xl p-12 relative overflow-hidden shadow-2xl h-full">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] -mr-48 -mt-48 rounded-full"></div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-[9px] font-black uppercase tracking-[0.2em] mb-8">Hành động cần ưu tiên</div>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                                <h2 className="text-4xl font-black text-white tracking-tight leading-none">Xét duyệt hồ sơ điều dưỡng</h2>
                                <Link to="/admin/pending-nurses" className="bg-white text-slate-900 px-8 py-4 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all">Xem tất cả</Link>
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
                                                <div className="h-14 w-14 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xl uppercase">
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
                </div>

                {/* System Alerts Side */}
                <div className="space-y-8">
                    <div className="bg-white rounded-xl p-10 border border-slate-50 shadow-xl shadow-slate-200/20">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cảnh báo hệ thống</h3>
                            <ExclamationCircleIcon className="h-6 w-6 text-rose-500" />
                        </div>
                        
                        <div className="space-y-4">
                            <div className="p-6 rounded-xl bg-rose-50 border border-rose-100">
                                <div className="flex gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-rose-500 flex items-center justify-center shrink-0">
                                        <ExclamationCircleIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-rose-900 leading-tight">Khiếu nại chưa xử lý</div>
                                        <div className="text-[10px] font-medium text-rose-500 mt-1 uppercase tracking-widest">Hiện đang có 1 trường hợp cần giải quyết.</div>
                                        <Link to="/admin/reports" className="mt-3 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:underline inline-block">Xử lý ngay</Link>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 opacity-60">
                                <div className="flex gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-slate-300 flex items-center justify-center shrink-0">
                                        <BanknotesIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900 leading-tight">Giao dịch thanh toán</div>
                                        <div className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-widest">Tất cả các luồng tiền đều đang vận hành ổn định.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-8 border border-slate-100 flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Truy cập nhanh:</div>
                        <div className="flex gap-2">
                            <Link to="/admin/users" className="px-4 py-2 rounded-xl bg-white text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">Người dùng</Link>
                            <Link to="/admin/bookings" className="px-4 py-2 rounded-xl bg-white text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">Lịch hẹn</Link>
                            <Link to="/admin/settings" className="px-4 py-2 rounded-xl bg-white text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">Cài đặt</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
