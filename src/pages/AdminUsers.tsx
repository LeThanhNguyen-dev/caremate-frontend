import { useEffect, useMemo, useState } from 'react';
import caremateApi from '../api/caremateApi';
import type { AdminUserDto, AdminBookingSummaryDto, NurseDiscoveryDto, NurseProfileDetailDto } from '../api/frontend-api-contract';
import { 
    MagnifyingGlassIcon, 
    ChevronRightIcon, 
    EnvelopeIcon, 
    PhoneIcon, 
    CalendarDaysIcon,
    ShieldCheckIcon,
    UserCircleIcon,
    
    ChatBubbleLeftRightIcon,
    NoSymbolIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

type DisplayUser = AdminUserDto & {
    source: 'api' | 'derived';
};

const roleLabels: Record<string, string> = {
    admin: 'Quản trị viên',
    customer: 'Khách hàng',
    nurse: 'Y tá',
    nurse_confirmed: 'Y tá đã duyệt',
    nurse_unconfirmed: 'Y tá chờ duyệt',
};

const buildDerivedUsers = (bookings: AdminBookingSummaryDto[], nurses: NurseDiscoveryDto[]): DisplayUser[] => {
    const customerBookingCount = new Map<number, number>();
    bookings.forEach((booking) => {
        customerBookingCount.set(booking.customerId, (customerBookingCount.get(booking.customerId) ?? 0) + 1);
    });

    const customers: DisplayUser[] = Array.from(customerBookingCount.entries()).map(([userId, bookingCount]) => ({
        userId,
        fullName: `Khách hàng #${userId}`,
        email: null,
        phone: null,
        role: 'customer',
        status: null,
        averageRating: null,
        yearsExperience: null,
        isVerified: null,
        bookingCount,
        bio: null,
        source: 'derived',
    }));

    const nurseUsers: DisplayUser[] = nurses.map((nurse) => ({
        userId: nurse.userId,
        fullName: nurse.fullName,
        email: null,
        phone: null,
        role: 'nurse',
        status: null,
        averageRating: nurse.averageRating,
        yearsExperience: nurse.yearsExperience,
        isVerified: null,
        bookingCount: bookings.filter((booking) => booking.nurseId === nurse.userId).length,
        bio: nurse.bio,
        source: 'derived',
    }));

    return [...customers, ...nurseUsers];
};

const AdminUsers = () => {
    const [users, setUsers] = useState<DisplayUser[]>([]);
    const [nurseDetails, setNurseDetails] = useState<Record<number, NurseProfileDetailDto>>({});
    const [selectedUser, setSelectedUser] = useState<DisplayUser | null>(null);
    const [filter, setFilter] = useState<'all' | 'customer' | 'nurse'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [apiUsers, bookings, nurses] = await Promise.all([
                    caremateApi.getAdminUsers().catch(() => []),
                    caremateApi.getAdminBookings().catch(() => []),
                    caremateApi.getNurses().catch(() => []),
                ]);

                const normalizedApiUsers: DisplayUser[] = apiUsers.map((item) => ({ ...item, source: 'api' }));
                const data = normalizedApiUsers.length > 0 ? normalizedApiUsers : buildDerivedUsers(bookings, nurses);
                setUsers(data);
                setSelectedUser(data[0] ?? null);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    useEffect(() => {
        const loadNurseDetail = async () => {
            if (!selectedUser) return;
            const isNurseRole = selectedUser.role.includes('nurse');
            if (!isNurseRole || nurseDetails[selectedUser.userId]) return;
            try {
                const detail = await caremateApi.getNurseByUserId(selectedUser.userId);
                setNurseDetails((prev) => ({ ...prev, [selectedUser.userId]: detail }));
            } catch {
                // Keep the view usable
            }
        };

        void loadNurseDetail();
    }, [nurseDetails, selectedUser]);

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesRole = filter === 'all' || u.role.includes(filter);
            const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesRole && matchesSearch;
        });
    }, [users, filter, searchQuery]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-admin border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">Đang tải dữ liệu nhân sự...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 selection:bg-admin/10">
            {/* Header Section */}
            <section className="grid gap-8 lg:grid-cols-[1fr_auto] items-end">
                <div>
                    <div className="accent-label">Quản trị tài khoản</div>
                    <h1 className="text-4xl font-black text-[#111827]">Người dùng Hệ thống</h1>
                    <p className="mt-4 text-sm font-bold text-[#6B7280]">Tổng cộng {users.length} tài khoản người dùng và đối tác y tá.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên, email..."
                            className="w-full sm:w-72 rounded-2xl border-none bg-white py-4 pl-14 pr-6 text-sm font-bold text-[#111827] shadow-sm focus:ring-2 focus:ring-admin/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex rounded-2xl bg-white p-1.5 shadow-sm">
                        {(['all', 'customer', 'nurse'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filter === t ? 'bg-[#111827] text-white shadow-lg' : 'text-[#6B7280] hover:text-admin hover:bg-admin/5'
                                }`}
                            >
                                {t === 'all' ? 'Tất cả' : t === 'customer' ? 'Khách' : 'Y tá'}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
                {/* User List Table */}
                <div className="luxury-card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-50">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Người dùng</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Vai trò</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Giao dịch</th>
                                    <th className="px-8 py-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((u) => (
                                    <tr 
                                        key={u.userId}
                                        onClick={() => setSelectedUser(u)}
                                        className={`group cursor-pointer transition-all hover:bg-admin/[0.02] ${selectedUser?.userId === u.userId ? 'bg-admin/[0.04]' : ''}`}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110 ${
                                                    u.role.includes('nurse') ? 'bg-purple-50 text-purple-600' : 'bg-admin/5 text-admin'
                                                }`}>
                                                    {u.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-[#111827]">{u.fullName}</div>
                                                    <div className="text-[11px] font-bold text-[#9CA3AF] mt-1">{u.email || `ID: #${u.userId}`}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                u.role === 'admin' ? 'bg-blue-50 text-blue-600' :
                                                u.role.includes('nurse') ? 'bg-purple-50 text-purple-600' : 'bg-admin/5 text-admin'
                                            }`}>
                                                {roleLabels[u.role] || u.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-xs font-black text-[#111827]">
                                                <CalendarDaysIcon className="h-4 w-4 text-slate-300" />
                                                {u.bookingCount || 0} Lịch hẹn
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right pr-12">
                                            <ChevronRightIcon className={`h-5 w-5 text-slate-300 transition-all ${selectedUser?.userId === u.userId ? 'translate-x-2 text-admin' : 'group-hover:translate-x-2'}`} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Details Side Panel */}
                <aside className="relative">
                    <AnimatePresence mode="wait">
                        {selectedUser ? (
                            <motion.div
                                key={selectedUser.userId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="luxury-card p-10 bg-white sticky top-28"
                            >
                                <div className="flex flex-col items-center text-center pb-10 border-b border-slate-50">
                                    <div className="relative mb-6">
                                        <div className="h-28 w-28 rounded-[2.5rem] bg-gradient-to-tr from-admin to-[#1D4ED8] flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-admin/20">
                                            {selectedUser.fullName.charAt(0)}
                                        </div>
                                        {selectedUser.isVerified === 'verified' && (
                                            <div className="absolute -bottom-1 -right-1 h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                                                <ShieldCheckIcon className="h-6 w-6 text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-3xl font-black text-[#111827]">{selectedUser.fullName}</h2>
                                    <div className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-admin">
                                        {roleLabels[selectedUser.role] || selectedUser.role}
                                    </div>
                                </div>

                                <div className="py-10 space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 rounded-3xl bg-slate-50">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-1">Mã nhân sự</div>
                                            <div className="text-sm font-black text-[#111827]">#{selectedUser.userId}</div>
                                        </div>
                                        <div className="p-5 rounded-3xl bg-slate-50">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-1">Xác minh</div>
                                            <div className={`text-sm font-black ${selectedUser.isVerified === 'verified' ? 'text-green-600' : 'text-amber-600'}`}>
                                                {selectedUser.isVerified === 'verified' ? 'Chính chủ' : 'Chờ xét duyệt'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 text-sm font-bold text-[#6B7280] p-4 bg-slate-50/50 rounded-2xl">
                                            <EnvelopeIcon className="h-5 w-5 text-slate-300" />
                                            {selectedUser.email || 'Chưa liên kết email'}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm font-bold text-[#6B7280] p-4 bg-slate-50/50 rounded-2xl">
                                            <PhoneIcon className="h-5 w-5 text-slate-300" />
                                            {selectedUser.phone || 'Chưa liên kết SĐT'}
                                        </div>
                                    </div>

                                    {selectedUser.role.includes('nurse') && (
                                        <div className="mt-10 pt-10 border-t border-slate-50 space-y-8">
                                            <div className="accent-label">Hồ sơ chuyên môn</div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                                                    <div className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">Kinh nghiệm</div>
                                                    <div className="text-xl font-black text-[#111827]">{selectedUser.yearsExperience || 0} Năm</div>
                                                </div>
                                                <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                                                    <div className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-1">Xếp hạng</div>
                                                    <div className="text-xl font-black text-[#111827]">{selectedUser.averageRating?.toFixed(1) || '0.0'} ★</div>
                                                </div>
                                            </div>
                                            <div className="p-6 rounded-3xl bg-slate-50 text-[13px] font-medium leading-relaxed text-[#6B7280]">
                                                {selectedUser.bio || 'Chưa có thông tin giới thiệu chi tiết cho tài khoản này.'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <button className="btn-primary flex-1 py-4 text-[10px] uppercase tracking-widest font-black !bg-admin shadow-lg shadow-admin/20 flex items-center justify-center gap-2">
                                        <ChatBubbleLeftRightIcon className="h-4 w-4" /> Liên hệ
                                    </button>
                                    <button className="btn-secondary flex-1 py-4 text-[10px] uppercase tracking-widest font-black border-slate-100 text-red-500 hover:bg-red-50 hover:border-red-100 flex items-center justify-center gap-2">
                                        <NoSymbolIcon className="h-4 w-4" /> Vô hiệu hóa
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="luxury-card p-24 text-center flex flex-col items-center justify-center text-[#9CA3AF] bg-slate-50/50 border-2 border-dashed border-slate-100">
                                <UserCircleIcon className="h-20 w-20 mb-6 opacity-10" />
                                <p className="text-xs font-black uppercase tracking-[0.2em]">Chọn tài khoản để quản trị</p>
                            </div>
                        )}
                    </AnimatePresence>
                </aside>
            </div>
        </div>
    );
};

export default AdminUsers;

