import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';
import NotificationDropdown from '../NotificationDropdown';
import { useAuth } from '../../hooks/useAuth';

const AdminHeader = () => {
    const location = useLocation();
    const { user } = useAuth();

    const getPageTitle = (path: string) => {
        switch (path) {
            case '/admin/dashboard':
                return 'Tổng quan hệ thống';
            case '/admin/pending-nurses':
                return 'Phê duyệt hồ sơ';
            case '/admin/users':
                return 'Quản lý người dùng';
            case '/admin/bookings':
                return 'Quản lý lịch hẹn';
            case '/admin/reports':
                return 'Báo cáo và khiếu nại';
            case '/admin/settings':
                return 'Cài đặt hệ thống';
            case '/admin/notifications':
                return 'Thông báo';
            default:
                return 'Quản trị viên';
        }
    };

    return (
        <header className="sticky top-0 z-40 border-b border-slate-50 bg-white/80 px-8 py-6 backdrop-blur-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl flex-1">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#3B82F6] shadow-sm">
                        Bảng điều khiển quản trị viên
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        {getPageTitle(location.pathname)}
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                        Giám sát và điều phối toàn bộ hoạt động của nền tảng CareMate.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative hidden items-center group md:flex">
                        <MagnifyingGlassIcon className="absolute left-4 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[#3B82F6]" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng, đơn hàng..."
                            className="w-80 rounded-xl border-none bg-slate-50 py-3 pl-12 pr-6 text-sm font-medium outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/5"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationDropdown
                            key={location.pathname}
                            accentClassName="bg-blue-50 text-[#3B82F6]"
                            badgeClassName="bg-[#3B82F6]"
                            buttonClassName="group relative rounded-xl bg-slate-50 p-3 text-slate-400 transition-all hover:bg-blue-50 hover:text-[#3B82F6]"
                            emptyIconClassName="text-blue-100"
                            alignClassName="right-0"
                        />

                        <div className="mx-2 h-10 w-[1px] bg-slate-100"></div>

                        <div className="hidden text-right sm:block">
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
