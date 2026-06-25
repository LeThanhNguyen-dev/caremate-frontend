import { Bars3Icon, PlusIcon } from '@heroicons/react/24/outline';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NotificationDropdown from '../NotificationDropdown';
import LanguageSwitcher from '../LanguageSwitcher';
import { useAuth } from '../../hooks/useAuth';

type NurseHeaderProps = {
    onMenuToggle?: () => void;
};

const NurseHeader = ({ onMenuToggle }: NurseHeaderProps) => {
    const location = useLocation();
    const { user } = useAuth();
    const { t } = useTranslation();

    const getPageMeta = (path: string) => {
        switch (path) {
            case '/nurse/overview': return { title: t('nurse.overviewTitle'), subtitle: t('nurse.overviewSubtitle') };
            case '/nurse/schedule': return { title: t('nurse.schedule'), subtitle: t('nurse.scheduleSubtitle') };
            case '/nurse/bookings': return { title: t('nurse.bookings'), subtitle: t('nurse.bookingsSubtitle') };
            case '/nurse/services': return { title: t('nurse.services'), subtitle: t('nurse.servicesSubtitle') };
            case '/nurse/profile': return { title: t('nurse.profileTitle'), subtitle: t('nurse.profileSubtitle') };
            case '/nurse/notifications': return { title: t('admin.notificationsTitle'), subtitle: t('nurse.notificationsSubtitle') };
            default: return { title: t('nurse.welcomeTitle'), subtitle: t('nurse.welcomeSubtitle') };
        }
    };

    const meta = getPageMeta(location.pathname);

    return (
        <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 px-4 py-4 backdrop-blur-2xl sm:px-6 lg:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3 sm:gap-4">
                    <button
                        type="button"
                        onClick={onMenuToggle}
                        className="mt-1 rounded-xl bg-slate-50 p-2.5 text-slate-500 transition hover:bg-emerald-50 hover:text-[#10B981] lg:hidden"
                        aria-label="Mở menu điều dưỡng"
                    >
                        <Bars3Icon className="h-5 w-5" />
                    </button>

                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-[#10B981] shadow-sm">
                            {t('nurse.nurseBadge')}
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">{meta.title}</h1>
                        <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{meta.subtitle}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <LanguageSwitcher />
                    <NotificationDropdown
                        key={location.pathname}
                        accentClassName="bg-emerald-50 text-[#10B981]"
                        badgeClassName="bg-[#10B981]"
                        buttonClassName="group relative rounded-xl bg-slate-50 p-2.5 text-slate-400 transition-all hover:bg-emerald-50 hover:text-[#10B981]"
                        emptyIconClassName="text-emerald-100"
                        alignClassName="right-0"
                    />

                    <Link to="/nurse/schedule" className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-xl bg-[#10B981] px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/15 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 active:scale-95">
                        <PlusIcon className="h-4 w-4" />
                        {t('nurse.setSchedule')}
                    </Link>

                    <div className="hidden items-center gap-3 border-l border-slate-100 pl-4 xl:flex">
                        <div className="text-right">
                            <div className="text-xs font-black text-slate-900">{user?.username}</div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-[#10B981]">
                                {t('nurse.roleLabel')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NurseHeader;
