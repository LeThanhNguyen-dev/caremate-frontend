import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    Cog8ToothIcon,
    CalendarDaysIcon,
    BellAlertIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';

const Layout = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navigation = [
        { name: 'Trang chủ', href: '/' },
        { name: 'Dịch vụ', href: '/services' },
        { name: 'Cộng đồng', href: '/community' },
        { name: 'Giới thiệu', href: '/about' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans">
            <header
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
                    scrolled ? 'bg-white/80 backdrop-blur-2xl py-2 shadow-xl shadow-slate-200/20' : 'bg-transparent py-6'
                }`}
            >
                <nav className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img src="/assets/images/logo.png" alt="CareMate Logo" className="h-20 w-auto object-contain transition-transform group-hover:scale-105" />
                        </Link>

                        <div className="hidden lg:flex items-center gap-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${
                                        location.pathname === item.href ? 'text-brand' : 'text-slate-500 hover:text-brand'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="lg:hidden p-2 text-slate-900" onClick={() => setMobileMenuOpen(true)}>
                            <Bars3Icon className="h-7 w-7" />
                        </button>

                        {isAuthenticated ? (
                            <div className="hidden lg:flex items-center gap-4">
                                <NotificationDropdown
                                    key={location.pathname}
                                    accentClassName="bg-brand/5 text-brand"
                                    badgeClassName="bg-brand animate-pulse"
                                    buttonClassName="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-brand hover:bg-brand/5 transition-all relative group"
                                />

                                <div className="relative">
                                    <button
                                        onClick={() => setProfileDropdownOpen((prev) => !prev)}
                                        className="flex items-center gap-4 pl-4 pr-2 py-2 rounded-xl bg-slate-50 hover:bg-white hover:shadow-lg transition-all group"
                                    >
                                        <div className="text-right hidden xl:block">
                                            <div className="text-sm font-black text-slate-900 group-hover:text-brand transition-colors">{user?.username}</div>
                                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                {user?.role === 'admin' ? 'Quản trị viên' : user?.role?.startsWith('nurse') ? 'Điều dưỡng' : 'Khách hàng'}
                                            </div>
                                        </div>
                                        <div className="h-10 w-10 rounded-xl bg-brand text-white flex items-center justify-center font-black text-lg">
                                            {user?.username?.charAt(0)}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {profileDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-4 w-72 bg-white rounded-xl shadow-2xl shadow-slate-900/10 border border-slate-50 p-6 z-[110]"
                                            >
                                                <div className="space-y-1 mb-6">
                                                    {[
                                                        { name: 'Cài đặt thông tin', icon: Cog8ToothIcon, href: '/profile' },
                                                        { name: 'Quản lý dịch vụ', icon: CalendarDaysIcon, href: '/my-bookings' },
                                                        { name: 'Thông báo của tôi', icon: BellAlertIcon, href: '/notifications' },
                                                    ].map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            to={item.href}
                                                            onClick={() => setProfileDropdownOpen(false)}
                                                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all group"
                                                        >
                                                            <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                                                                <item.icon className="h-4 w-4" />
                                                            </div>
                                                            <span className="text-xs font-black">{item.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => void handleLogout()}
                                                    className="flex w-full items-center gap-4 p-3 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all group"
                                                >
                                                    <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-black">Đăng xuất</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden lg:flex items-center gap-8">
                                <Link to="/login" className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-900 hover:text-brand">Đăng nhập</Link>
                                <Link to="/register" className="btn-primary !px-10 !py-5 !text-[12px] !uppercase !tracking-[0.2em] shadow-xl shadow-slate-900/10">Bắt đầu ngay</Link>
                            </div>
                        )}
                    </div>
                </nav>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-0 z-[150] lg:hidden"
                        >
                            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                            <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white p-8 shadow-2xl flex flex-col">
                                <div className="flex items-center justify-between mb-12">
                                    <Link to="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                                        <img src="/assets/images/logo.png" alt="CareMate Logo" className="h-20 w-auto object-contain" />
                                    </Link>
                                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-900"><XMarkIcon className="h-7 w-7" /></button>
                                </div>
                                <div className="flex-1 space-y-6">
                                    {navigation.map((item) => (
                                        <Link key={item.name} to={item.href} className="block text-3xl font-black text-slate-900 hover:text-brand transition-colors" onClick={() => setMobileMenuOpen(false)}>{item.name}</Link>
                                    ))}
                                    <div className="pt-12 border-t border-slate-100 space-y-4">
                                        {isAuthenticated ? (
                                            <button onClick={() => void handleLogout()} className="w-full text-left text-3xl font-black text-red-600">Đăng xuất</button>
                                        ) : (
                                            <>
                                                <Link to="/login" className="block text-3xl font-black text-slate-900" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
                                                <Link to="/register" className="btn-primary w-full py-5 text-lg" onClick={() => setMobileMenuOpen(false)}>Tham gia ngay</Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="flex-grow pt-32">
                <Outlet />
            </main>

            <footer className="bg-slate-900 pt-32 pb-12 text-white overflow-hidden relative">
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand/5 blur-[120px] -mr-48 -mb-48 rounded-full"></div>

                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                        <div className="space-y-8">
                            <Link to="/" className="flex items-center gap-3 group">
                                <img src="/assets/images/logo.png" alt="CareMate Logo" className="h-24 w-auto object-contain brightness-0 invert" />
                            </Link>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-xs">
                                Định nghĩa lại tiêu chuẩn chăm sóc gia đình Việt với công nghệ và sự tận tâm từ trái tim.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8">Điều hướng</h4>
                            <ul className="space-y-4 text-sm font-bold">
                                <li><Link to="/" className="hover:text-brand transition-colors text-slate-400 hover:text-white">Trang chủ</Link></li>
                                <li><Link to="/services" className="hover:text-brand transition-colors text-slate-400 hover:text-white">Dịch vụ</Link></li>
                                <li><Link to="/community" className="hover:text-brand transition-colors text-slate-400 hover:text-white">Cộng đồng</Link></li>
                                <li><Link to="/about" className="hover:text-brand transition-colors text-slate-400 hover:text-white">Giới thiệu</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8">Trung tâm hỗ trợ</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-400">
                                <li><Link to="/" className="hover:text-white transition-colors">Câu hỏi thường gặp</Link></li>
                                <li><Link to="/" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
                                <li><Link to="/" className="hover:text-white transition-colors">Liên hệ 24/7</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8">Văn phòng</h4>
                            <div className="text-sm font-bold space-y-4 text-slate-400">
                                <p>HCM: Khu Công nghệ cao, Quận 9</p>
                                <p>Hotline: 1900 6789</p>
                                <p className="text-brand">support@caremate.vn</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-center md:text-left">
                            &copy; 2026 CareMate. Luxury Care Experience.
                        </div>
                        <div className="flex gap-6">
                            {['FB', 'IG', 'LI', 'YT'].map((social) => (
                                <div key={social} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand transition-all cursor-pointer group">
                                    <span className="text-[10px] font-black group-hover:scale-110 transition-transform">{social}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
