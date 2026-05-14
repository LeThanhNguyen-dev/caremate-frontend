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
import caremateApi from '../api/caremateApi';
import type { AdminUserDto } from '../api/frontend-api-contract';
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
    customer: { label: 'Khach hang', className: 'bg-blue-50 text-blue-600', icon: UserCircleIcon },
    nurse: { label: 'Dieu duong cho', className: 'bg-amber-50 text-amber-600', icon: BriefcaseIcon },
    nurse_unconfirmed: { label: 'Dieu duong cho', className: 'bg-amber-50 text-amber-600', icon: BriefcaseIcon },
    nurse_confirmed: { label: 'Dieu duong xac minh', className: 'bg-emerald-50 text-emerald-600', icon: ShieldCheckIcon },
    admin: { label: 'Quan tri vien', className: 'bg-slate-900 text-white', icon: UserCircleIcon },
};

const statusLabels: Record<string, { label: string; className: string }> = {
    active: { label: 'Dang hoat dong', className: 'bg-emerald-50 text-emerald-600' },
    blocked: { label: 'Da khoa', className: 'bg-rose-50 text-rose-600' },
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

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await caremateApi.getAdminUsers();
            setUsers(data);
        } catch (error) {
            showToast('Khong the tai danh sach nguoi dung.', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

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
            showToast('Da tao tai khoan nguoi dung.', 'success');
        } catch (error) {
            showToast('Khong the tao tai khoan. Kiem tra email, so dien thoai hoac mat khau.', 'error');
            console.error(error);
        } finally {
            setSavingCreate(false);
        }
    };

    const handleToggleStatus = async (user: AdminUserDto) => {
        const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
        const confirmMessage =
            nextStatus === 'blocked'
                ? `Khoa tai khoan ${user.fullName}? Nguoi dung se khong dang nhap duoc.`
                : `Mo khoa tai khoan ${user.fullName}?`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setUpdatingUserId(user.userId);
            const updated = await caremateApi.updateAdminUserStatus(user.userId, { status: nextStatus });
            setUsers((prev) => prev.map((item) => (item.userId === updated.userId ? updated : item)));
            setSelectedUser((current) => (current?.userId === updated.userId ? updated : current));
            showToast(nextStatus === 'blocked' ? 'Da khoa tai khoan.' : 'Da mo khoa tai khoan.', 'success');
        } catch (error) {
            showToast('Khong the cap nhat trang thai tai khoan.', 'error');
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
                        Dang dong bo du lieu nguoi dung...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            <section className="flex flex-col justify-between gap-8 xl:flex-row xl:items-center">
                <div className="flex flex-1 flex-col items-center gap-4 md:flex-row">
                    <div className="group relative w-full flex-1">
                        <MagnifyingGlassIcon className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#3B82F6]" />
                        <input
                            type="text"
                            placeholder="Tim kiem theo ten, email hoac so dien thoai..."
                            className="w-full rounded-xl border border-slate-100 bg-white py-4 pl-14 pr-8 text-sm font-bold text-slate-900 shadow-sm outline-none transition-all focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5"
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
                                className={`rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    roleFilter === role
                                        ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-600/20'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                }`}
                            >
                                {role === 'all' ? 'Tat ca' : roleLabels[role]?.label || role}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => void fetchUsers()}
                        className="rounded-lg border border-slate-100 bg-white p-4 text-slate-400 shadow-sm transition-all hover:bg-blue-50 hover:text-[#3B82F6] active:scale-95"
                        title="Tai lai"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        Tao tai khoan moi
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user, idx) => {
                        const roleConfig = roleLabels[user.role] || {
                            label: user.role,
                            className: 'bg-slate-100 text-slate-600',
                            icon: UserCircleIcon,
                        };
                        const statusConfig = statusLabels[user.status ?? 'active'] ?? statusLabels.active;
                        const isBlocked = user.status === 'blocked';

                        return (
                            <motion.div
                                key={user.userId}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                                className="group relative overflow-hidden rounded-xl border border-slate-50 bg-white p-8 shadow-xl shadow-slate-200/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-600/5"
                            >
                                <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-blue-500/5 opacity-0 blur-[40px] transition-opacity group-hover:opacity-100"></div>

                                <div className="relative z-10 mb-8 flex items-center justify-between">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 text-2xl font-black text-white shadow-xl shadow-slate-900/10 transition-transform group-hover:scale-110">
                                        {(user.fullName ?? 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${statusConfig.className}`}>
                                        {statusConfig.label}
                                    </span>
                                </div>

                                <div className="relative z-10 space-y-1">
                                    <h3 className="truncate text-xl font-black tracking-tight text-slate-900">{user.fullName}</h3>
                                    <p className="truncate text-sm font-bold text-slate-400">{user.email ?? 'Chua co email'}</p>
                                    <p className="truncate border-b border-slate-50 pb-4 text-xs font-bold text-slate-300">
                                        {user.phone ?? 'Chua co so dien thoai'}
                                    </p>
                                </div>

                                <div className="relative z-10 mt-6 flex items-center justify-between">
                                    <div className={`flex items-center gap-2 rounded-xl border border-transparent px-4 py-1.5 text-[9px] font-black uppercase tracking-widest ${roleConfig.className}`}>
                                        <roleConfig.icon className="h-3.5 w-3.5" />
                                        {roleConfig.label}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                                        {user.bookingCount ?? 0} lich hen
                                    </span>
                                </div>

                                <div className="relative z-10 mt-8 grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(user)}
                                        className="rounded-xl bg-slate-50 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-100"
                                    >
                                        Chi tiet
                                    </button>
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
                                        {isBlocked ? 'Mo khoa' : 'Khoa'}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {filteredUsers.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm font-bold text-slate-400">
                    Khong co tai khoan phu hop.
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
                            className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Tao tai khoan</h2>
                                    <p className="mt-1 text-sm font-bold text-slate-400">
                                        Admin chi tao tai khoan khach hang hoac dieu duong cho duyet.
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
                                    placeholder="Ho va ten"
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
                                    placeholder="So dien thoai"
                                />
                                <input
                                    required
                                    type="password"
                                    minLength={6}
                                    value={createForm.password}
                                    onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                                    className="rounded-xl border border-slate-100 px-5 py-4 text-sm font-bold outline-none focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/5"
                                    placeholder="Mat khau tam thoi"
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
                                    <option value="customer">Khach hang</option>
                                    <option value="nurse_unconfirmed">Dieu duong cho duyet</option>
                                </select>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="rounded-xl bg-slate-50 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100"
                                >
                                    Huy
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingCreate}
                                    className="rounded-xl bg-[#3B82F6] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                >
                                    {savingCreate ? 'Dang tao...' : 'Tao tai khoan'}
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
                            className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                        >
                            <div className="mb-8 flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">{selectedUser.fullName}</h2>
                                    <p className="mt-1 text-sm font-bold text-slate-400">{selectedUser.email ?? 'Chua co email'}</p>
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
                                <div className="flex justify-between rounded-xl bg-slate-50 px-5 py-4">
                                    <span className="text-slate-400">Vai tro</span>
                                    <span className="text-slate-900">{roleLabels[selectedUser.role]?.label ?? selectedUser.role}</span>
                                </div>
                                <div className="flex justify-between rounded-xl bg-slate-50 px-5 py-4">
                                    <span className="text-slate-400">Trang thai</span>
                                    <span className="text-slate-900">
                                        {statusLabels[selectedUser.status ?? 'active']?.label ?? selectedUser.status}
                                    </span>
                                </div>
                                <div className="flex justify-between rounded-xl bg-slate-50 px-5 py-4">
                                    <span className="text-slate-400">So dien thoai</span>
                                    <span className="text-slate-900">{selectedUser.phone ?? 'Chua co'}</span>
                                </div>
                                <div className="flex justify-between rounded-xl bg-slate-50 px-5 py-4">
                                    <span className="text-slate-400">Lich hen</span>
                                    <span className="text-slate-900">{selectedUser.bookingCount ?? 0}</span>
                                </div>
                                {selectedUser.role !== 'customer' && (
                                    <>
                                        <div className="flex justify-between rounded-xl bg-slate-50 px-5 py-4">
                                            <span className="text-slate-400">Kinh nghiem</span>
                                            <span className="text-slate-900">{selectedUser.yearsExperience ?? 0} nam</span>
                                        </div>
                                        <div className="flex justify-between rounded-xl bg-slate-50 px-5 py-4">
                                            <span className="text-slate-400">Danh gia</span>
                                            <span className="text-slate-900">{selectedUser.averageRating ?? 0}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => void handleToggleStatus(selectedUser)}
                                disabled={updatingUserId === selectedUser.userId}
                                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 ${
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
                                {selectedUser.status === 'blocked' ? 'Mo khoa tai khoan' : 'Khoa tai khoan'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;
