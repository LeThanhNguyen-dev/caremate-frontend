import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import NotificationDropdown from '../NotificationDropdown';

const AdminHeader = () => {
    const location = useLocation();
    const { user } = useAuth();

    const getPageTitle = (path: string) => {
        switch (path) {
            case '/admin/dashboard': return 'Tổng quan hệ thống';
            case '/admin/pending-nurses': return 'Phê duyệt hồ sơ';
            case '/admin/users': return 'Quản lý người dùng';
            case '/admin/bookings': return 'Quản lý lịch hẹn';
            case '/admin/reports': return 'Báo cáo & Khiếu nại';
            case '/admin/settings': return 'Cài đặt hệ thống';
            default: return 'Quản trị viên';
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl px-8 py-6 border-b border-slate-50">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#3B82F6] text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                        Bảng điều khiển quản trị viên
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{getPageTitle(location.pathname)}</h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">Giám sát và điều phối toàn bộ hoạt động của nền tảng CareMate.</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center relative group">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 text-slate-400 group-focus-within:text-[#3B82F6] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm người dùng, đơn hàng..." 
                            className="bg-slate-50 border-none rounded-lg py-3 pl-12 pr-6 text-sm font-medium w-80 focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationDropdown
                            key={location.pathname}
                            accentClassName="bg-blue-50 text-[#3B82F6]"
                            badgeClassName="bg-[#3B82F6]"
                            buttonClassName="p-3 rounded-lg bg-slate-50 text-slate-400 hover:text-[#3B82F6] hover:bg-blue-50 transition-all relative group"
                            emptyIconClassName="text-blue-100"
                        />
                        
                        <div className="h-10 w-[1px] bg-slate-100 mx-2"></div>

                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-black text-slate-900 uppercase">{user?.username || 'Admin'}</div>
                            <div className="text-[9px] font-bold text-[#3B82F6] uppercase tracking-[0.3em]">Administrator</div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
