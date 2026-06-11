import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
    Squares2X2Icon, 
    UserGroupIcon, 
    ClipboardDocumentCheckIcon, 
    CalendarIcon,
    ExclamationTriangleIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menuItems = [
        { label: 'Tá»•ng quan', path: '/admin/dashboard', icon: Squares2X2Icon },
        { label: 'Duyá»‡t Ä‘iá»u dÆ°á»¡ng', path: '/admin/pending-nurses', icon: ClipboardDocumentCheckIcon },
        { label: 'Quáº£n lÃ½ ngÆ°á»i dÃ¹ng', path: '/admin/users', icon: UserGroupIcon },
        { label: 'Táº¥t cáº£ lá»‹ch háº¹n', path: '/admin/bookings', icon: CalendarIcon },
        { label: 'Tin nháº¯n há»— trá»£', path: '/admin/chat', icon: ChatBubbleLeftRightIcon },
        { label: 'Khiáº¿u náº¡i & Há»— trá»£', path: '/admin/reports', icon: ExclamationTriangleIcon },
        { label: 'CÃ i Ä‘áº·t há»‡ thá»‘ng', path: '/admin/settings', icon: Cog6ToothIcon },
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
                    <img src="/assets/images/logo-new-transparent.png" alt="CareMate Admin" className="h-24 w-auto object-contain" />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto custom-scrollbar">
                <div className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Menu há»‡ thá»‘ng</div>
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
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Quáº£n trá»‹ viÃªn há»‡ thá»‘ng</div>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-3 py-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#3B82F6] transition-all active:scale-95 shadow-sm"
                >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    ÄÄƒng xuáº¥t há»‡ thá»‘ng
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
