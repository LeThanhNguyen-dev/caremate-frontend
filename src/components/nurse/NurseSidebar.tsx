import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { 
    Squares2X2Icon, 
    CalendarIcon, 
    ClipboardDocumentListIcon, 
    BriefcaseIcon, 
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const NurseSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    const items = [
        { label: t('nurse.overview'), path: '/nurse/overview', icon: Squares2X2Icon, requiresApproval: true, tour: 'nurse-nav-overview' },
        { label: t('nurse.schedule'), path: '/nurse/schedule', icon: CalendarIcon, requiresApproval: true, tour: 'nurse-nav-schedule' },
        { label: t('nurse.bookings'), path: '/nurse/bookings', icon: ClipboardDocumentListIcon, requiresApproval: true, tour: 'nurse-nav-bookings' },
        { label: t('nurse.chat'), path: '/nurse/chat', icon: ChatBubbleLeftRightIcon, requiresApproval: true, tour: 'nurse-nav-chat' },
        { label: t('nurse.services'), path: '/nurse/services', icon: BriefcaseIcon, requiresApproval: true, tour: 'nurse-nav-services' },
        { label: t('nurse.profile'), path: '/nurse/profile', icon: UserCircleIcon, requiresApproval: false, tour: 'nurse-nav-profile' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-[300px] flex-col bg-white border-r border-slate-100 lg:flex">
            {/* Logo Section */}
            <div className="p-8">
                <Link to="/nurse/overview" className="flex items-center gap-3 group">
                    <img src="/assets/images/caremate-brand-logo.png" alt="CareMate Nurse" className="h-16 w-auto object-contain" />
                </Link>
            </div>

            {/* Status Card */}
            <div className="px-6 mb-8">
                <div className="bg-slate-900 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheckIcon className={`h-4 w-4 ${user?.role === 'nurse_confirmed' ? 'text-[#10B981]' : 'text-amber-400'}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/50">{t('nurse.profileStatus')}</span>
                        </div>
                        <div className="text-sm font-bold text-white mb-2">
                            {user?.role === 'nurse_confirmed' ? t('nurse.verified') : t('nurse.pending')}
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: user?.role === 'nurse_confirmed' ? '100%' : '60%' }}
                                className="h-full bg-[#10B981]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                <div className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('nurse.managementMenu')}</div>
                {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const isRestricted = item.requiresApproval && user?.role !== 'nurse_confirmed';
                    
                    if (isRestricted) {
                        return (
                            <div 
                                key={item.path}
                                data-tour={item.tour}
                                className="flex items-center justify-between px-6 py-4 rounded-xl text-slate-300 cursor-not-allowed opacity-60"
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className="h-5 w-5 text-slate-300" />
                                    <span className="text-sm font-bold">{item.label}</span>
                                </div>
                                <LockClosedIcon className="h-4 w-4" />
                            </div>
                        );
                    }

                    return (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            data-tour={item.tour}
                            className={`flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-bold transition-all group ${
                                isActive 
                                ? 'bg-[#10B981] text-white shadow-xl shadow-emerald-600/20' 
                                : 'text-slate-500 hover:bg-emerald-50 hover:text-[#10B981]'
                            }`}
                        >
                            <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#10B981]'}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Profile */}
            <div className="p-6 mt-auto border-t border-slate-50">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-[#10B981] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-600/10">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900 truncate">{user?.username}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">ID: {user?.role}</div>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-3 py-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shadow-sm"
                >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    {t('auth.logout')}
                </button>
            </div>
        </aside>
    );
};

export default NurseSidebar;
