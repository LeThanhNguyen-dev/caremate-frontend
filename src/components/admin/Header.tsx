import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NotificationDropdown from '../NotificationDropdown';
import LanguageSwitcher from '../LanguageSwitcher';
import { useAuth } from '../../hooks/useAuth';

type AdminHeaderProps = {
    onMenuToggle?: () => void;
};

const AdminHeader = ({ onMenuToggle }: AdminHeaderProps) => {
    const location = useLocation();
    const { user } = useAuth();
    const { t } = useTranslation();

    const getPageTitle = (path: string) => {
        switch (path) {
            case '/admin/dashboard':
                return t('admin.dashboardTitle');
            case '/admin/pending-nurses':
                return t('admin.pendingNursesTitle');
            case '/admin/users':
                return t('admin.usersTitle');
            case '/admin/bookings':
                return t('admin.bookingsTitle');
            case '/admin/finance':
                return t('admin.financeTitle');
            case '/admin/audit-logs':
                return t('admin.auditLogs');
            case '/admin/reports':
                return t('admin.reportsTitle');
            case '/admin/settings':
                return t('admin.settings');
            case '/admin/notifications':
                return t('admin.notificationsTitle');
            default:
                return 'Admin';
        }
    };

    return (
        <header className="sticky top-0 z-40 border-b border-slate-50 bg-white/85 px-4 py-4 backdrop-blur-2xl sm:px-6 sm:py-5 lg:px-8 lg:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3 sm:gap-4">
                    <button
                        type="button"
                        onClick={onMenuToggle}
                        className="mt-1 rounded-xl bg-slate-50 p-2.5 text-slate-500 transition hover:bg-blue-50 hover:text-[#3B82F6] lg:hidden"
                        aria-label="Mở menu quản trị"
                    >
                        <Bars3Icon className="h-5 w-5" />
                    </button>

                    <div className="max-w-xl flex-1">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#3B82F6] shadow-sm sm:px-4">
                            {t('admin.adminBadge')}
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                            {getPageTitle(location.pathname)}
                        </h1>
                        <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                            {t('admin.adminSubtitle')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
                    <div className="group relative hidden items-center md:flex">
                        <MagnifyingGlassIcon className="absolute left-4 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[#3B82F6]" />
                        <input
                            type="text"
                            placeholder={t('admin.searchPlaceholder')}
                            className="w-72 rounded-xl border-none bg-slate-50 py-3 pl-12 pr-6 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/5 lg:w-80"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-start">
                        <div className="flex items-center gap-3">
                            <LanguageSwitcher />
                            <NotificationDropdown
                                key={location.pathname}
                                accentClassName="bg-blue-50 text-[#3B82F6]"
                                badgeClassName="bg-[#3B82F6]"
                                buttonClassName="group relative rounded-xl bg-slate-50 p-3 text-slate-400 transition-all hover:bg-blue-50 hover:text-[#3B82F6]"
                                emptyIconClassName="text-blue-100"
                                alignClassName="right-0"
                            />
                        </div>

                        <div className="hidden h-10 w-[1px] bg-slate-100 sm:block"></div>

                        <div className="text-right">
                            <div className="text-xs font-black uppercase text-slate-900">
                                {user?.username || 'Admin'}
                            </div>
                            <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#3B82F6]">
                                Administrator
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
