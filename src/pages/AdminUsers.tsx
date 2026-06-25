import { useCallback, useEffect, useMemo, useState, type ComponentType, type FormEvent, type SVGProps } from 'react';
import {
    ArrowPathIcon,
    BriefcaseIcon,
    LockClosedIcon,
    LockOpenIcon,
    MagnifyingGlassIcon,
    ShieldCheckIcon,
    UserCircleIcon,
    UserPlusIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import caremateApi from '../api/caremateApi';
import type { AdminUserDto } from '../api/frontend-api-contract';
import { useTranslation } from 'react-i18next';
import { useToast } from '../hooks/useToast';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

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
    role: 'customer',
};

const roleLabels: Record<string, { label: string; className: string; icon: IconComponent }> = {
    customer: { label: 'Khách hàng', className: 'bg-blue-50 text-blue-600', icon: UserCircleIcon },
    nurse: { label: 'Điều dưỡng chờ', className: 'bg-amber-50 text-amber-600', icon: BriefcaseIcon },
    nurse_unconfirmed: { label: 'Điều dưỡng chờ', className: 'bg-amber-50 text-amber-600', icon: BriefcaseIcon },
    nurse_confirmed: { label: 'Điều dưỡng xác minh', className: 'bg-emerald-50 text-emerald-600', icon: ShieldCheckIcon },
    admin: { label: 'Quản trị viên', className: 'bg-slate-900 text-white', icon: UserCircleIcon },
};

const statusLabels: Record<string, { label: string; className: string }> = {
    active: { label: 'Đang hoạt động', className: 'bg-emerald-50 text-emerald-600' },
    blocked: { label: 'Đã khóa', className: 'bg-rose-50 text-rose-600' },
};

const isNurseRole = (role: string) => role === 'nurse' || role === 'nurse_unconfirmed' || role === 'nurse_confirmed';

const AdminUsers = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState<AdminUserDto | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState<CreateUserForm>(emptyCreateForm);
    const [savingCreate, setSavingCreate] = useState(false);
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await caremateApi.getAdminUsers();
            setUsers(data);
        } catch (error) {
            showToast(t('adminUsers.loadError'), 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [showToast, t]);

    useEffect(() => {
        void fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        return users.filter((user) => {
            const matchesSearch =
                !keyword ||
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
                role: createForm.role,
            });
            setUsers((prev) => [created, ...prev]);
            setCreateForm(emptyCreateForm);
            setIsCreateOpen(false);
            showToast(t('adminUsers.createSuccess'), 'success');
        } catch (error) {
            showToast(t('adminUsers.createError'), 'error');
            console.error(error);
        } finally {
            setSavingCreate(false);
        }
    };

    const handleToggleStatus = async (user: AdminUserDto) => {
        const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
        const confirmMessage =
            nextStatus === 'blocked'
                ? t('adminUsers.blockConfirm', { name: user.fullName })
                : t('adminUsers.unblockConfirm', { name: user.fullName });

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setUpdatingUserId(user.userId);
            const updated = await caremateApi.updateAdminUserStatus(user.userId, { status: nextStatus });
            setUsers((prev) => prev.map((item) => (item.userId === updated.userId ? updated : item)));
            setSelectedUser((current) => (current?.userId === updated.userId ? updated : current));
            showToast(nextStatus === 'blocked' ? t('adminUsers.blockSuccess') : t('adminUsers.unblockSuccess'), 'success');
        } catch (error) {
            showToast(t('adminUsers.statusUpdateError'), 'error');
            console.error(error);
        } finally {
            setUpdatingUserId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#3B82F6] border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Đang đồng bộ dữ liệu người dùng...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16 sm:space-y-12 sm:pb-20">
            <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
                    <div className="group relative w-full flex-1">
                        <MagnifyingGlassIcon className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#3B82F6]" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                            className="w-full rounded-xl border border-slate-100 bg-white py-4 pl-12 pr-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition-all focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5 sm:pl-14 sm:pr-8"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-white p-1.5 shadow-sm">
                        {['all', 'customer', 'nurse_unconfirmed', 'nurse_confirmed'].map((role) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setRoleFilter(role)}
                                className={`rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all sm:px-5 ${
                                    roleFilter === role
                                        ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-600/20'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                }`}
                            >
                                {role === 'all' ? 'Tất cả' : roleLabels[role]?.label || role}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => void fetchUsers()}
                        className="rounded-xl border border-slate-100 bg-white p-4 text-slate-400 shadow-sm transition-all hover:bg-blue-50 hover:text-[#3B82F6] active:scale-95"
                        title="Tải lại"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 sm:px-8"
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        Tạo tài khoản mới
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user, idx) => {
                        const roleConfig = roleLabels[user.role] || {
                            label: user.role,
                            className: 'bg-slate-100 text-slate-600',
                            icon: UserCircleIcon,
                        };
                        const statusConfig = statusLabels[user.status ?? 'active'] ?? statusLabels.active;
                        const isBlocked = user.status === 'blocked';
                        const canViewVerificationProfile = isNurseRole(user.role);

                        return (
                            <motion.div
                                key={user.userId}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                                className="group relative overflow-hidden rounded-xl border border-slate-50 bg-white p-6 shadow-xl shadow-slate-200/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-600/5 sm:p-8"
                            >
                                <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-blue-500/5 opacity-0 blur-[40px] transition-opacity group-hover:opacity-100"></div>

                                <div className="relative z-10 mb-6 flex items-center justify-between sm:mb-8">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-xl font-black text-white shadow-xl shadow-slate-900/10 transition-transform group-hover:scale-110 sm:h-16 sm:w-16 sm:text-2xl">
                                        {(user.fullName ?? 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${statusConfig.className}`}>
                                        {statusConfig.label}
                                    </span>
                                </div>

                                <div className="relative z-10 space-y-1">
                                    <h3 className="truncate text-lg font-black tracking-tight text-slate-900 sm:text-xl">{user.fullName}</h3>
                                    <p className="truncate text-sm font-bold text-slate-400">{user.email ?? 'Chưa có email'}</p>
                                    <p className="truncate border-b border-slate-50 pb-4 text-xs font-bold text-slate-300">
                                        {user.phone ?? 'Chưa có số điện thoại'}
                                    </p>
                                </div>

                                <div className="relative z-10 mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className={`inline-flex items-center gap-2 rounded-xl border border-transparent px-4 py-1.5 text-[9px] font-black uppercase tracking-widest ${roleConfig.className}`}>
                                        <roleConfig.icon className="h-3.5 w-3.5" />
                                        {roleConfig.label}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                                        {user.bookingCount ?? 0} lịch hẹn
                                    </span>
                                </div>

                                <div className={`relative z-10 mt-8 grid gap-3 ${canViewVerificationProfile ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(user)}
                                        className="rounded-xl bg-slate-50 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-100"
                                    >
                                        Chi tiết
                                    </button>
                                    {canViewVerificationProfile && (
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/admin/nurses/${user.userId}`, { state: { backTo: '/admin/users' } })}
                                            className="rounded-xl bg-blue-50 py-3 text-[10px] font-black uppercase tracking-widest text-[#3B82F6] transition-all hover:bg-blue-100"
                                        >
                                            Hồ sơ
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => void handleToggleStatus(user)}
                                        disabled={updatingUserId === user.userId}
                                        className={`rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
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
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.form
                            onSubmit={handleCreateUser}
                            className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl sm:p-8"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Tạo tài khoản</h2>
                                    <p className="mt-1 text-sm font-bold text-slate-400">
                                        Admin chỉ tạo tài khoản khách hàng hoặc điều dưỡng chờ duyệt.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <input
                                    required
                                    value={createForm.fullName}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, fullName: event.target.value }))}
                                    className="rounded-xl border border-slate-100 px-5 py-4 text-sm font-bold outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5"
                                    placeholder="Họ và tên"
                                />
                                <input
                                    required
                                    type="email"
                                    value={createForm.email}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                                    className="rounded-xl border border-slate-100 px-5 py-4 text-sm font-bold outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5"
                                    placeholder="Email"
                                />
                                <input
                                    value={createForm.phone}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, phone: event.target.value }))}
                                    className="rounded-xl border border-slate-100 px-5 py-4 text-sm font-bold outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5"
                                    placeholder="Số điện thoại"
                                />
                                <input
                                    required
                                    type="password"
                                    minLength={6}
                                    value={createForm.password}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                                    className="rounded-xl border border-slate-100 px-5 py-4 text-sm font-bold outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5"
                                    placeholder="Mật khẩu tạm thời"
                                />
                                <select
                                    value={createForm.role}
                                    onChange={(event) =>
                                        setCreateForm((prev) => ({
                                            ...prev,
                                            role: event.target.value as CreateUserForm['role'],
                                        }))
                                    }
                                    className="rounded-xl border border-slate-100 px-5 py-4 text-sm font-bold outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5"
                                >
                                    <option value="customer">Khách hàng</option>
                                    <option value="nurse_unconfirmed">Điều dưỡng chờ duyệt</option>
                                </select>
                            </div>

                            <div className="mt-8 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="rounded-xl bg-slate-50 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingCreate}
                                    className="rounded-xl bg-[#3B82F6] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                >
                                    {savingCreate ? 'Đang tạo...' : 'Tạo tài khoản'}
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}

                {selectedUser && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl sm:p-8"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                        >
                            <div className="mb-8 flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h2 className="truncate text-2xl font-black text-slate-900">{selectedUser.fullName}</h2>
                                    <p className="mt-1 truncate text-sm font-bold text-slate-400">{selectedUser.email ?? 'Chưa có email'}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedUser(null)}
                                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 text-sm font-bold">
                                <div className="flex justify-between gap-4 rounded-xl bg-slate-50 px-5 py-4">
                                    <span className="text-slate-400">Vai trò</span>
                                    <span className="text-right text-slate-900">{roleLabels[selectedUser.role]?.label ?? selectedUser.role}</span>
                                </div>
                                <div className="flex justify-between gap-4 rounded-xl bg-slate-50 px-5 py-4">
                                    <span className="text-slate-400">Trạng thái</span>
                                    <span className="text-right text-slate-900">
                                        {statusLabels[selectedUser.status ?? 'active']?.label ?? selectedUser.status}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4 rounded-xl bg-slate-50 px-5 py-4">
                                    <span className="text-slate-400">Số điện thoại</span>
                                    <span className="text-right text-slate-900">{selectedUser.phone ?? 'Chưa có'}</span>
                                </div>
                                <div className="flex justify-between gap-4 rounded-xl bg-slate-50 px-5 py-4">
                                    <span className="text-slate-400">Lịch hẹn</span>
                                    <span className="text-right text-slate-900">{selectedUser.bookingCount ?? 0}</span>
                                </div>
                                {selectedUser.role !== 'customer' && (
                                    <>
                                        <div className="flex justify-between gap-4 rounded-xl bg-slate-50 px-5 py-4">
                                            <span className="text-slate-400">Kinh nghiệm</span>
                                            <span className="text-right text-slate-900">{selectedUser.yearsExperience ?? 0} năm</span>
                                        </div>
                                        <div className="flex justify-between gap-4 rounded-xl bg-slate-50 px-5 py-4">
                                            <span className="text-slate-400">Đánh giá</span>
                                            <span className="text-right text-slate-900">{selectedUser.averageRating ?? 0}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className={`mt-8 grid gap-3 ${isNurseRole(selectedUser.role) ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                                {isNurseRole(selectedUser.role) && (
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/admin/nurses/${selectedUser.userId}`, { state: { backTo: '/admin/users' } })}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#3B82F6] hover:bg-blue-100"
                                    >
                                        Xem hồ sơ xác minh
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => void handleToggleStatus(selectedUser)}
                                    disabled={updatingUserId === selectedUser.userId}
                                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 ${
                                        selectedUser.status === 'blocked'
                                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                    }`}
                                >
                                    {selectedUser.status === 'blocked' ? (
                                        <LockOpenIcon className="h-5 w-5" />
                                    ) : (
                                        <LockClosedIcon className="h-5 w-5" />
                                    )}
                                    {selectedUser.status === 'blocked' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;
