import { useState, useEffect, useMemo, type FormEvent } from 'react';
import caremateApi from '../api/caremateApi';
import type { AdminUserDto } from '../api/frontend-api-contract';
import {
    MagnifyingGlassIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    BriefcaseIcon,
    ArrowPathIcon,
    UserPlusIcon,
    LockClosedIcon,
    LockOpenIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../hooks/useToast';

type CreateUserForm = {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: 'customer' | 'nurse_unconfirmed';
};

const emptyCreateForm: CreateUserForm = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
};

const roleLabels: Record<string, { label: string; className: string; icon: any }> = {
    customer: { label: 'Khách hàng', className: 'bg-blue-50 text-blue-600', icon: UserCircleIcon },
    nurse: { label: 'Điều dưỡng chờ', className: 'bg-amber-50 text-amber-600', icon: BriefcaseIcon },
    nurse_unconfirmed: { label: 'Điều dưỡng chờ', className: 'bg-amber-50 text-amber-600', icon: BriefcaseIcon },
    nurse_confirmed: { label: 'Điều dưỡng xác minh', className: 'bg-emerald-50 text-emerald-600', icon: ShieldCheckIcon },
};

const statusLabels: Record<string, { label: string; className: string }> = {
    active: { label: 'Đang hoạt động', className: 'bg-emerald-50 text-emerald-600' },
    blocked: { label: 'Đã khóa', className: 'bg-rose-50 text-rose-600' },
};

const AdminUsers = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState<AdminUserDto | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreateUserForm>(emptyCreateForm);
    const [savingCreate, setSavingCreate] = useState(false);
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await caremateApi.getAdminUsers();
            setUsers(data);
        } catch (err) {
            showToast('Không thể tải danh sách người dùng.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        return users.filter(user => {
            const matchesSearch = !keyword ||
                (user.fullName ?? '').toLowerCase().includes(keyword) ||
                (user.email ?? '').toLowerCase().includes(keyword) ||
                (user.phone ?? '').toLowerCase().includes(keyword);
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setSavingCreate(true);
            const created = await caremateApi.createAdminUser({
                fullName: createForm.fullName.trim(),
                email: createForm.email.trim(),
                phone: createForm.phone.trim() || undefined,
                password: createForm.password,
                role: createForm.role
            });
            setUsers(prev => [created, ...prev]);
            setCreateForm(emptyCreateForm);
            setIsCreateOpen(false);
            showToast('Đã tạo tài khoản người dùng.', 'success');
        } catch (err) {
            showToast('Không thể tạo tài khoản. Kiểm tra email, số điện thoại hoặc mật khẩu.', 'error');
            console.error(err);
        } finally {
            setSavingCreate(false);
        }
    };

    const handleToggleStatus = async (user: AdminUserDto) => {
        const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
        const confirmMessage = nextStatus === 'blocked'
            ? `Khóa tài khoản ${user.fullName}? Người dùng sẽ không đăng nhập được.`
            : `Mở khóa tài khoản ${user.fullName}?`;

        if (!window.confirm(confirmMessage)) return;

        try {
            setUpdatingUserId(user.userId);
            const updated = await caremateApi.updateAdminUserStatus(user.userId, { status: nextStatus });
            setUsers(prev => prev.map(item => item.userId === updated.userId ? updated : item));
            setSelectedUser(current => current?.userId === updated.userId ? updated : current);
            showToast(nextStatus === 'blocked' ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.', 'success');
        } catch (err) {
            showToast('Không thể cập nhật trạng thái tài khoản.', 'error');
            console.error(err);
        } finally {
            setUpdatingUserId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#3B82F6] border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang đồng bộ dữ liệu người dùng...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
                    <div className="relative flex-1 w-full group">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B82F6] transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                            className="w-full bg-white border border-slate-100 rounded-xl py-4 pl-14 pr-8 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#3B82F6] transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm">
                        {['all', 'customer', 'nurse_unconfirmed', 'nurse_confirmed'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    roleFilter === role
                                    ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {role === 'all' ? 'Tất cả' : roleLabels[role]?.label || role}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchUsers}
                        className="p-4 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-[#3B82F6] hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                        title="Tải lại"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#3B82F6] text-white px-8 py-4 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center gap-2 hover:scale-[1.02] transition-all active:scale-95"
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        Tạo tài khoản mới
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user, idx) => {
                        const roleConfig = roleLabels[user.role] || { label: user.role, className: 'bg-slate-100 text-slate-600', icon: UserCircleIcon };
                        const statusConfig = statusLabels[user.status ?? 'active'] ?? statusLabels.active;
                        const isBlocked = user.status === 'blocked';

                        return (
                            <motion.div
                                key={user.userId}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                                className="group bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] -mr-16 -mt-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="h-16 w-16 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform">
                                        {(user.fullName ?? 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${statusConfig.className}`}>
                                        {statusConfig.label}
                                    </span>
                                </div>

                                <div className="space-y-1 relative z-10">
                                    <h3 className="text-xl font-black text-slate-900 truncate tracking-tight">{user.fullName}</h3>
                                    <p className="text-sm font-bold text-slate-400 truncate">{user.email ?? 'Chưa có email'}</p>
                                    <p className="text-xs font-bold text-slate-300 truncate pb-4 border-b border-slate-50">{user.phone ?? 'Chưa có số điện thoại'}</p>
                                </div>

                                <div className="mt-6 flex items-center justify-between relative z-10">
                                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-transparent ${roleConfig.className} flex items-center gap-2`}>
                                        <roleConfig.icon className="h-3.5 w-3.5" />
                                        {roleConfig.label}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">{user.bookingCount ?? 0} lịch hẹn</span>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-3 relative z-10">
                                    <button
                                        onClick={() => setSelectedUser(user)}
                                        className="py-3 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                                    >
                                        Chi tiết
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(user)}
                                        disabled={updatingUserId === user.userId}
                                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
                                            isBlocked
                                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                        }`}
                                    >
                                        {isBlocked ? 'Mở khóa' : 'Khóa'}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {filteredUsers.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm font-bold text-slate-400">
                    Không có tài khoản phù hợp.
                </div>
            )}

            <AnimatePresence>
                {isCreateOpen && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.form
                            onSubmit={handleCreateUser}
                            className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Tạo tài khoản</h2>
                                    <p className="mt-1 text-sm font-bold text-slate-400">Admin chỉ tạo tài khoản khách hàng hoặc điều dưỡng chờ duyệt.</p>
                                </div>
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <input required value={createForm.fullName} onChange={(e) => setCreateForm(prev => ({ ...prev, fullName: e.target.value }))} className="rounded-xl border border-slate-100 px-5 py-4 text-sm font-bold outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5" placeholder="Họ và tên" />
                                <input required type="email" value={createForm.email} onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))} className="rounded-xl border border-slate-100 px-5 py-4 text-sm font-bold outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5" placeholder="Email" />
                                <input value={createForm.phone} onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))} className="rounded-xl border border-slate-100 px-5 py-4 text-sm font-bold outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5" placeholder="Số điện thoại" />
                                <input required type="password" minLength={6} value={createForm.password} onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))} className="rounded-xl border border-slate-100 px-5 py-4 text-sm font-bold outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5" placeholder="Mật khẩu tạm thời" />
                                <select value={createForm.role} onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as CreateUserForm['role'] }))} className="rounded-xl border border-slate-100 px-5 py-4 text-sm font-bold outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5">
                                    <option value="customer">Khách hàng</option>
                                    <option value="nurse_unconfirmed">Điều dưỡng chờ duyệt</option>
                                </select>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="rounded-xl bg-slate-50 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100">Hủy</button>
                                <button disabled={savingCreate} className="rounded-xl bg-[#3B82F6] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 disabled:opacity-50">
                                    {savingCreate ? 'Đang tạo...' : 'Tạo tài khoản'}
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}

                {selectedUser && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div
                            className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                        >
                            <div className="mb-8 flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">{selectedUser.fullName}</h2>
                                    <p className="mt-1 text-sm font-bold text-slate-400">{selectedUser.email ?? 'Chưa có email'}</p>
                                </div>
                                <button type="button" onClick={() => setSelectedUser(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 text-sm font-bold">
                                <div className="flex justify-between rounded-xl bg-slate-50 px-5 py-4"><span className="text-slate-400">Vai trò</span><span className="text-slate-900">{roleLabels[selectedUser.role]?.label ?? selectedUser.role}</span></div>
                                <div className="flex justify-between rounded-xl bg-slate-50 px-5 py-4"><span className="text-slate-400">Trạng thái</span><span className="text-slate-900">{statusLabels[selectedUser.status ?? 'active']?.label ?? selectedUser.status}</span></div>
                                <div className="flex justify-between rounded-xl bg-slate-50 px-5 py-4"><span className="text-slate-400">Số điện thoại</span><span className="text-slate-900">{selectedUser.phone ?? 'Chưa có'}</span></div>
                                <div className="flex justify-between rounded-xl bg-slate-50 px-5 py-4"><span className="text-slate-400">Lịch hẹn</span><span className="text-slate-900">{selectedUser.bookingCount ?? 0}</span></div>
                                {selectedUser.role !== 'customer' && (
                                    <>
                                        <div className="flex justify-between rounded-xl bg-slate-50 px-5 py-4"><span className="text-slate-400">Kinh nghiệm</span><span className="text-slate-900">{selectedUser.yearsExperience ?? 0} năm</span></div>
                                        <div className="flex justify-between rounded-xl bg-slate-50 px-5 py-4"><span className="text-slate-400">Đánh giá</span><span className="text-slate-900">{selectedUser.averageRating ?? 0}</span></div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => handleToggleStatus(selectedUser)}
                                disabled={updatingUserId === selectedUser.userId}
                                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 ${
                                    selectedUser.status === 'blocked'
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                }`}
                            >
                                {selectedUser.status === 'blocked' ? <LockOpenIcon className="h-5 w-5" /> : <LockClosedIcon className="h-5 w-5" />}
                                {selectedUser.status === 'blocked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;
