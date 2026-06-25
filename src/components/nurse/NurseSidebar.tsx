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
    ChatBubbleLeftRightIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

type NurseSidebarProps = {
    mobileOpen?: boolean;
    onClose?: () => void;
};

const NurseSidebar = ({ mobileOpen = false, onClose }: NurseSidebarProps) => {
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
        onClose?.();
        navigate('/login');
    };

    const handleLinkClick = () => {
        onClose?.();
    };

    const sidebarContent = (
        <>
            <div className="flex items-center justify-between p-6 sm:p-8">
                <Link to="/nurse/overview" className="flex items-center gap-3 group" onClick={handleLinkClick}>
                    <img src="/assets/images/caremate-brand-logo.png" alt="CareMate Nurse" className="h-14 w-auto object-contain sm:h-16" />
                </Link>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                    aria-label="Đóng menu điều dưỡng"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="mb-6 px-5 sm:px-6">
                <div className="relative overflow-hidden rounded-xl bg-slate-900 p-5 sm:p-6">
                    <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 bg-emerald-500/10 blur-[40px]"></div>
                    <div className="relative z-10">
                        <div className="mb-3 flex items-center gap-2">
                            <ShieldCheckIcon className={`h-4 w-4 ${user?.role === 'nurse_confirmed' ? 'text-[#10B981]' : 'text-amber-400'}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/50">{t('nurse.profileStatus')}</span>
                        </div>
                        <div className="mb-2 text-sm font-bold text-white">
                            {user?.role === 'nurse_confirmed' ? t('nurse.verified') : t('nurse.pending')}
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: user?.role === 'nurse_confirmed' ? '100%' : '60%' }}
                                className="h-full bg-[#10B981]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto px-4 custom-scrollbar">
                <div className="mb-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('nurse.managementMenu')}</div>
                {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const isRestricted = item.requiresApproval && user?.role !== 'nurse_confirmed';

                    if (isRestricted) {
                        return (
                            <div
                                key={item.path}
                                data-tour={item.tour}
                                className="flex cursor-not-allowed items-center justify-between rounded-xl px-5 py-3.5 text-slate-300 opacity-60 sm:px-6 sm:py-4"
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
                            onClick={handleLinkClick}
                            data-tour={item.tour}
                            className={`flex items-center gap-4 rounded-xl px-5 py-3.5 text-sm font-bold transition-all group sm:px-6 sm:py-4 ${
                                isActive
                                    ? 'bg-[#10B981] text-white shadow-xl shadow-emerald-600/20'
                                    : 'text-slate-500 hover:bg-emerald-50 hover:text-[#10B981]'
                            }`}
                        >
                            <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#10B981]'}`} />
                            <span className="truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-slate-50 p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981] text-xl font-black text-white shadow-lg shadow-emerald-600/10">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-black text-slate-900">{user?.username}</div>
                        <div className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">ID: {user?.role}</div>
                    </div>
                </div>
                <button
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-red-600 active:scale-95"
                >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    {t('auth.logout')}
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

export default NurseSidebar;
