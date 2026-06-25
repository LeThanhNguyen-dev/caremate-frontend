import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import {
    Squares2X2Icon,
    UserGroupIcon,
    ClipboardDocumentCheckIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    ChatBubbleLeftRightIcon,
    BanknotesIcon,
    ClipboardDocumentListIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

type AdminSidebarProps = {
    mobileOpen?: boolean;
    onClose?: () => void;
};

const AdminSidebar = ({ mobileOpen = false, onClose }: AdminSidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    const menuItems = [
        { label: t('admin.dashboard'), path: '/admin/dashboard', icon: Squares2X2Icon },
        { label: t('admin.pendingNurses'), path: '/admin/pending-nurses', icon: ClipboardDocumentCheckIcon },
        { label: t('admin.users'), path: '/admin/users', icon: UserGroupIcon },
        { label: t('admin.bookings'), path: '/admin/bookings', icon: CalendarIcon },
        { label: t('admin.finance'), path: '/admin/finance', icon: BanknotesIcon },
        { label: t('admin.auditLogs'), path: '/admin/audit-logs', icon: ClipboardDocumentListIcon },
        { label: t('admin.chat'), path: '/admin/chat', icon: ChatBubbleLeftRightIcon },
        { label: t('admin.reports'), path: '/admin/reports', icon: ExclamationTriangleIcon },
        { label: t('admin.settings'), path: '/admin/settings', icon: Cog6ToothIcon },
    ];

    const handleLogout = async () => {
        await logout();
        onClose?.();
        navigate('/login');
    };

    const handleLinkClick = () => {
        onClose?.();
    };

    const sidebarContent = (
        <>
            <div className="flex items-center justify-between p-6 sm:p-8">
                <Link to="/admin/dashboard" className="flex items-center gap-3 group" onClick={handleLinkClick}>
                    <img src="/assets/images/caremate-brand-logo.png" alt="CareMate Admin" className="h-14 w-auto object-contain sm:h-16" />
                </Link>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                    aria-label="Đóng menu quản trị"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>

            <nav className="mt-2 flex-1 space-y-2 overflow-y-auto px-4 custom-scrollbar">
                <div className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('admin.systemMenu')}</div>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-4 rounded-xl px-5 py-3.5 text-sm font-bold transition-all group sm:px-6 sm:py-4 ${
                                isActive
                                    ? 'bg-[#3B82F6] text-white shadow-xl shadow-blue-600/20'
                                    : 'text-slate-500 hover:bg-blue-50 hover:text-[#3B82F6]'
                            }`}
                        >
                            <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#3B82F6]'}`} />
                            <span className="truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-slate-50 p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B82F6] text-xl font-black uppercase text-white shadow-lg shadow-blue-600/10">
                        {user?.username?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-black text-slate-900">{user?.username || 'System Admin'}</div>
                        <div className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('admin.systemAdmin')}</div>
                    </div>
                </div>
                <button
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-[#3B82F6] active:scale-95"
                >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    {t('admin.logoutSystem')}
                </button>
            </div>
        </>
    );

    return (
        <>
            <aside className="fixed inset-y-0 left-0 z-50 hidden w-[300px] flex-col border-r border-slate-100 bg-white lg:flex">
                {sidebarContent}
            </aside>

            <div className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                <div
                    className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={onClose}
                />
                <aside
                    className={`absolute inset-y-0 left-0 flex w-[86vw] max-w-[320px] flex-col border-r border-slate-100 bg-white shadow-2xl transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    {sidebarContent}
                </aside>
            </div>
        </>
    );
};

export default AdminSidebar;
