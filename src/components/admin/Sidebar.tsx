import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Squares2X2Icon,
    UsersIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    QuestionMarkCircleIcon,
    ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Navigation items
    const navItems = [
        { name: 'Dashboard', icon: Squares2X2Icon, path: '/admin/dashboard' },
        { name: 'Users', icon: UsersIcon, path: '/admin/users' },
        { name: 'Service Bookings', icon: CalendarDaysIcon, path: '/admin/bookings' },
        { name: 'Financial Reports', icon: ChartBarIcon, path: '/admin/reports' },
        { name: 'Settings', icon: Cog6ToothIcon, path: '/admin/settings' },
    ];

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <aside className="w-[250px] min-h-screen bg-[#F7F9FC] hidden lg:flex flex-col border-r border-gray-100 flex-shrink-0 fixed left-0 top-0 bottom-0 z-50 transition-all duration-300">
            {/* Top Sidebar */}
            <div className="p-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-[#4F8CFF] flex items-center justify-center">
                        {/* Logo Icon placeholder */}
                        <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">MaternalCare</h1>
                        <p className="text-xs text-gray-500">Admin Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                                ? 'bg-[#4F8CFF] text-white shadow-md shadow-blue-200'
                                : 'text-gray-500 hover:bg-white hover:text-[#4F8CFF] hover:shadow-sm'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Sidebar */}
            <div className="p-4 space-y-4">
                {/* Need Help Box */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-[#4F8CFF]">
                            <QuestionMarkCircleIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Need Help?</p>
                            <p className="text-xs text-gray-400">Check our docs</p>
                        </div>
                    </div>
                    <button className="w-full py-2 text-xs font-semibold text-[#4F8CFF] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        Support Center
                    </button>
                </div>

                {/* User Profile & Logout */}
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm text-[#4F8CFF] font-bold">
                            {user?.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.username || 'Admin'}</p>
                            <p className="text-xs text-gray-400 truncate uppercase">{user?.role || 'System Admin'}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 group"
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
