import { useState, useEffect, useMemo, useCallback, type ComponentType, type SVGProps } from 'react';
import caremateApi from '../api/caremateApi';
import type { AdminUserDto } from '../api/frontend-api-contract';
import { 
    MagnifyingGlassIcon, 
    UserCircleIcon,
    ShieldCheckIcon,
    BriefcaseIcon,
    EllipsisVerticalIcon,
    ArrowPathIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../hooks/useToast';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const roleLabels: Record<string, { label: string; class: string; icon: IconComponent }> = {
    customer: { label: 'Khách hàng', class: 'bg-blue-50 text-blue-600', icon: UserCircleIcon },
    nurse: { label: 'Đ.Dưỡng chờ', class: 'bg-amber-50 text-amber-600', icon: BriefcaseIcon },
    nurse_confirmed: { label: 'Đ.Dưỡng xác minh', class: 'bg-emerald-50 text-emerald-600', icon: ShieldCheckIcon },
    admin: { label: 'Quản trị viên', class: 'bg-slate-900 text-white', icon: UserCircleIcon },
};

const AdminUsers = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const fetchUsers = useCallback(async () => {
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
    }, [showToast]);

    useEffect(() => {
        void fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = (user.fullName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                (user.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

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
            {/* Control Bar */}
            <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
                    <div className="relative flex-1 w-full group">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3B82F6] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên hoặc email..." 
                            className="w-full bg-white border border-slate-100 rounded-xl py-4 pl-14 pr-8 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#3B82F6] transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm">
                        {['all', 'customer', 'nurse_confirmed', 'admin'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
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
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                    </button>
                    <button className="bg-[#3B82F6] text-white px-8 py-4 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center gap-2 hover:scale-[1.02] transition-all active:scale-95">
                        <UserPlusIcon className="h-5 w-5" />
                        Tạo tài khoản mới
                    </button>
                </div>
            </section>

            {/* User Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                <AnimatePresence mode='popLayout'>
                    {filteredUsers.map((user, idx) => {
                        const config = roleLabels[user.role] || { label: user.role, class: 'bg-slate-100 text-slate-600', icon: UserCircleIcon };
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
                                    <button className="h-10 w-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-colors">
                                        <EllipsisVerticalIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="space-y-1 relative z-10">
                                    <h3 className="text-xl font-black text-slate-900 truncate tracking-tight">{user.fullName}</h3>
                                    <p className="text-sm font-bold text-slate-400 truncate pb-4 border-b border-slate-50">{user.email ?? 'Chưa có email'}</p>
                                </div>

                                <div className="mt-6 flex items-center justify-between relative z-10">
                                    <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-transparent ${config.class} flex items-center gap-2`}>
                                        <config.icon className="h-3.5 w-3.5" />
                                        {config.label}
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20 animate-pulse"></div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">Online</span>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-3 relative z-10">
                                    <button className="py-3 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Chi tiết</button>
                                    <button className="py-3 rounded-xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-rose-600 hover:bg-rose-50 transition-all">Khóa thẻ</button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminUsers;
