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
    ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
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
        navigate('/login');
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-[300px] flex-col bg-white border-r border-slate-100 lg:flex">
            {/* Logo Section */}
            <div className="p-8">
                <Link to="/admin/dashboard" className="flex items-center gap-3 group">
                    <img src="/assets/images/caremate-brand-logo.png" alt="CareMate Admin" className="h-16 w-auto object-contain" />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto custom-scrollbar">
                <div className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('admin.systemMenu')}</div>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className={`flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-bold transition-all group ${
                                isActive 
                                ? 'bg-[#3B82F6] text-white shadow-xl shadow-blue-600/20' 
                                : 'text-slate-500 hover:bg-blue-50 hover:text-[#3B82F6]'
                            }`}
                        >
                            <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#3B82F6]'}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Profile */}
            <div className="p-6 mt-auto border-t border-slate-50">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-[#3B82F6] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/10 uppercase">
                        {user?.username?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900 truncate">{user?.username || 'System Admin'}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{t('admin.systemAdmin')}</div>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-3 py-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#3B82F6] transition-all active:scale-95 shadow-sm"
                >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    {t('admin.logoutSystem')}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
