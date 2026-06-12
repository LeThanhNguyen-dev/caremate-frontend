import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    Cog8ToothIcon,
    CalendarDaysIcon,
    BellAlertIcon,
    ChatBubbleLeftRightIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';
import BookingTour from './BookingTour';
import PageTransition from './PageTransition';
import caremateApi from '../api/caremateApi';
import type { ServiceDetailDto } from '../api/frontend-api-contract';
import { getCategoryLabel, getIncludedServiceLabels } from '../utils/servicePresentation';

const Layout = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [services, setServices] = useState<ServiceDetailDto[]>([]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        let mounted = true;
        const loadServices = async () => {
            try {
                const data = await caremateApi.getServices();
                if (mounted) {
                    setServices(data.filter((service) => service.status === 'active'));
                }
            } catch {
                if (mounted) setServices([]);
            }
        };

        void loadServices();
        return () => {
            mounted = false;
        };
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
    const socialLinks = [
        { label: 'FB', href: 'https://www.facebook.com/profile.php?id=61586875252074' },
        { label: 'IG' },
        { label: 'LI' },
        { label: 'YT' },
    ];

    const serviceGroups = services.reduce<Array<{ category: string; title: string; items: ServiceDetailDto[] }>>((groups, service) => {
        const category = service.category || 'khac';
        const existing = groups.find((group) => group.category === category);
        if (existing) {
            existing.items.push(service);
        } else {
            groups.push({ category, title: getCategoryLabel(category), items: [service] });
        }
        return groups;
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans">
            <header
                className={`fixed top-0 left-0 right-0 z-[100] bg-white/95 py-2 shadow-sm shadow-slate-200/50 backdrop-blur-2xl transition-all duration-500 ${
                    scrolled ? 'lg:bg-white/88 lg:py-2 lg:shadow-xl lg:shadow-slate-200/35' : 'lg:bg-white/70 lg:py-3 lg:shadow-none'
                }`}
            >
                <nav className="mx-auto grid w-full max-w-[1760px] grid-cols-[auto_1fr] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:px-8 2xl:px-10">
                    <div className="flex items-center justify-start">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img src="/assets/images/caremate-brand-logo.png" alt="CareMate Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-105 sm:h-14 lg:h-16" />
                        </Link>
                    </div>

                    <div className="hidden min-w-0 items-center justify-center lg:flex">
                        <div className="flex items-center justify-center gap-9">
                            {navigation.map((item) => (
                                item.name === 'Dịch vụ' ? (
                                    <div key={item.name} className="group relative">
                                        <Link
                                            to={item.href}
                                            data-tour="nav-services"
                                            className={`inline-flex items-center gap-1.5 text-[17px] font-extrabold tracking-[0.01em] transition-colors ${
                                                location.pathname.startsWith('/services') ? 'text-brand' : 'text-slate-500 hover:text-brand'
                                            }`}
                                        >
                                            {item.name}
                                            <ChevronDownIcon className="h-4 w-4 transition group-hover:rotate-180" />
                                        </Link>

                                        {!location.pathname.startsWith('/services') && (
                                        <div className="pointer-events-none absolute left-0 top-full z-[120] w-[min(860px,calc(100vw-2rem))] pt-5 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                                            <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-2xl shadow-slate-900/10">
                                                <div className="grid grid-cols-[300px_minmax(0,1fr)] gap-3">
                                                    <div className="rounded-2xl bg-slate-50 p-2">
                                                        <Link
                                                            to="/services"
                                                            className="mb-2 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#10233F] shadow-sm transition hover:text-brand"
                                                        >
                                                            Tất cả dịch vụ
                                                            <ChevronDownIcon className="-rotate-90 h-4 w-4 text-slate-300" />
                                                        </Link>
                                                        <div className="space-y-1">
                                                            {serviceGroups.length === 0 && (
                                                                <div className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-500">
                                                                    Đang tải danh mục dịch vụ...
                                                                </div>
                                                            )}
                                                            {serviceGroups.map((group) => (
                                                                <div key={group.title} className="group/category relative">
                                                                    <Link
                                                                        to={`/services?category=${encodeURIComponent(group.category)}`}
                                                                        className="flex items-start justify-between gap-3 rounded-2xl px-4 py-3 transition hover:bg-white hover:shadow-sm"
                                                                    >
                                                                        <span>
                                                                            <span className="block text-sm font-black text-[#10233F] transition group-hover/category:text-brand">{group.title}</span>
                                                                            <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">{group.items.length} dịch vụ</span>
                                                                        </span>
                                                                        <ChevronDownIcon className="-rotate-90 mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover/category:text-brand" />
                                                                    </Link>

                                                                    <div className="invisible absolute left-full top-0 z-[130] w-[540px] pl-3 opacity-0 transition duration-150 group-hover/category:visible group-hover/category:opacity-100">
                                                                        <div className="absolute bottom-0 left-0 top-0 w-3" />
                                                                        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-2xl shadow-slate-900/10">
                                                                            <div className="mb-3 px-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{group.title}</div>
                                                                            <div className="max-h-[460px] overflow-y-auto pr-1">
                                                                                <div className="grid gap-1.5">
                                                                                {group.items.map((service) => {
                                                                                    const included = getIncludedServiceLabels(service);
                                                                                    return (
                                                                                    <Link
                                                                                        key={service.id}
                                                                                        to={`/services/${service.id}`}
                                                                                        className="group/item rounded-2xl px-3 py-3 transition hover:bg-brand-soft"
                                                                                    >
                                                                                        <div className="text-sm font-black text-[#10233F] transition group-hover/item:text-brand">{service.name}</div>
                                                                                        <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-black text-slate-400">
                                                                                            <span className="rounded-full bg-slate-50 px-2 py-1">{service.serviceKind === 'package' ? 'Gói dịch vụ' : 'Dịch vụ đơn'}</span>
                                                                                            <span className="rounded-full bg-slate-50 px-2 py-1">{service.packageDays ?? 1} buổi</span>
                                                                                        </div>
                                                                                        {included.length > 0 && (
                                                                                            <div className="mt-2 space-y-1">
                                                                                                {included.map((item) => (
                                                                                                    <div key={item} className="line-clamp-1 text-xs font-semibold leading-5 text-slate-500">
                                                                                                        {item}
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        )}
                                                                                    </Link>
                                                                                    );
                                                                                })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-pink-50 p-5">
                                                        <div className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-brand shadow-sm">Dịch vụ CareMate</div>
                                                        <h3 className="mt-4 text-xl font-black leading-tight text-[#10233F]">Tất cả dịch vụ được nhóm theo danh mục.</h3>
                                                        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                                                            Rê vào danh mục bên trái để xem toàn bộ dịch vụ và các dịch vụ con trong từng gói.
                                                        </p>
                                                        <Link to="/services" className="mt-5 inline-flex rounded-full bg-[#10233F] px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:bg-brand">
                                                            Xem tất cả
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`text-[17px] font-extrabold tracking-[0.01em] transition-colors ${
                                            location.pathname === item.href ? 'text-brand' : 'text-slate-500 hover:text-brand'
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-6">
                        <button className="relative z-[120] shrink-0 rounded-xl p-2 text-[#10233F] hover:bg-slate-100 lg:hidden" onClick={() => setMobileMenuOpen(true)} aria-label="Mở menu">
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
                                            <div className="text-sm font-black text-[#10233F] group-hover:text-brand transition-colors">{user?.username}</div>
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
                                                className="absolute right-0 mt-4 w-72 bg-white rounded-xl shadow-2xl shadow-[#10233F]/10 border border-slate-50 p-6 z-[110]"
                                            >
                                                <div className="space-y-1 mb-6">
                                                    {[
                                                        { name: 'Cài đặt thông tin', icon: Cog8ToothIcon, href: '/profile' },
                                                        { name: 'Quản lý dịch vụ', icon: CalendarDaysIcon, href: '/my-bookings' },
                                                        { name: 'Nhắn tin hỗ trợ', icon: ChatBubbleLeftRightIcon, href: '/chat' },
                                                        { name: 'Thông báo của tôi', icon: BellAlertIcon, href: '/notifications' },
                                                    ].map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            to={item.href}
                                                            onClick={() => setProfileDropdownOpen(false)}
                                                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-[#10233F] transition-all group"
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
                            <div className="hidden lg:flex items-center gap-6">
                                <Link to="/login" className="text-[17px] font-extrabold tracking-[0.01em] text-[#10233F] transition hover:text-brand">Đăng nhập</Link>
                                <Link to="/register" className="rounded-full bg-[#10233F] px-10 py-[18px] text-[15px] font-black uppercase tracking-[0.1em] text-white shadow-xl shadow-[#10233F]/15 transition hover:bg-brand hover:shadow-brand/20">Bắt đầu ngay</Link>
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
                            className="fixed inset-0 z-[150] min-h-dvh lg:hidden"
                        >
                            <div className="absolute inset-0 bg-[#10233F]/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                            <div className="absolute inset-y-0 right-0 flex w-full max-w-none flex-col overflow-hidden bg-white shadow-2xl sm:max-w-sm">
                                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                                    <Link to="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                                        <img src="/assets/images/caremate-brand-logo.png" alt="CareMate Logo" className="h-12 w-auto object-contain" />
                                    </Link>
                                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#10233F]"><XMarkIcon className="h-7 w-7" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-5 py-6">
                                    <div className="space-y-2">
                                    {navigation.map((item) => (
                                        item.name === 'Dịch vụ' ? (
                                            <div key={item.name} className="rounded-2xl bg-slate-50 p-2">
                                                <Link
                                                    to={item.href}
                                                    data-tour="nav-services"
                                                    className={`block rounded-xl px-4 py-3 text-xl font-black leading-tight transition-colors ${
                                                        location.pathname.startsWith('/services') ? 'bg-white text-brand shadow-sm' : 'text-[#10233F] hover:bg-white hover:text-brand'
                                                    }`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    {item.name}
                                                </Link>
                                                <div className="mt-2 grid gap-3 px-2 pb-2">
                                                    {serviceGroups.length === 0 && (
                                                        <div className="rounded-xl px-3 py-2 text-sm font-black text-slate-500">Đang tải dịch vụ...</div>
                                                    )}
                                                    {serviceGroups.map((group) => (
                                                        <div key={group.category}>
                                                            <Link
                                                                to={`/services?category=${encodeURIComponent(group.category)}`}
                                                                className="block rounded-xl bg-white px-3 py-2 text-sm font-black text-[#10233F] shadow-sm hover:text-brand"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                            >
                                                                {group.title}
                                                            </Link>
                                                            <div className="mt-1 grid gap-1 pl-3">
                                                                {group.items.map((service) => {
                                                                    const included = getIncludedServiceLabels(service);
                                                                    return (
                                                                        <Link
                                                                            key={service.id}
                                                                            to={`/services/${service.id}`}
                                                                            className="rounded-xl px-3 py-2 text-sm font-black text-slate-600 hover:bg-white hover:text-brand"
                                                                            onClick={() => setMobileMenuOpen(false)}
                                                                        >
                                                                            <span>{service.name}</span>
                                                                            {included.length > 0 && (
                                                                                <span className="mt-1 block text-xs font-semibold leading-5 text-slate-400">
                                                                                    {included.slice(0, 2).join(' • ')}
                                                                                </span>
                                                                            )}
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className={`block rounded-2xl px-4 py-3 text-xl font-black leading-tight transition-colors ${
                                                    location.pathname === item.href ? 'bg-brand-soft text-brand' : 'text-[#10233F] hover:bg-slate-50 hover:text-brand'
                                                }`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {item.name}
                                            </Link>
                                        )
                                    ))}
                                    </div>
                                    <div className="mt-6 border-t border-slate-100 pt-6 space-y-3">
                                        {isAuthenticated ? (
                                            <button onClick={() => void handleLogout()} className="w-full rounded-2xl px-4 py-3 text-left text-xl font-black leading-tight text-red-600 hover:bg-red-50">Đăng xuất</button>
                                        ) : (
                                            <>
                                                <Link to="/login" className="block rounded-2xl px-4 py-3 text-xl font-black leading-tight text-[#10233F] hover:bg-slate-50" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
                                                <Link to="/register" className="btn-primary w-full py-4 text-sm" onClick={() => setMobileMenuOpen(false)}>Tham gia ngay</Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="flex-grow pt-28 lg:pt-36">
                <BookingTour />
                <PageTransition />
            </main>

            <footer className="bg-[#10233F] pt-28 pb-12 text-white overflow-hidden relative">
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand/5 blur-[120px] -mr-48 -mb-48 rounded-full"></div>

                <div className="relative z-10 mx-auto w-full max-w-[1760px] px-6 lg:px-8 2xl:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                        <div className="space-y-8">
                            <Link to="/" className="flex items-center gap-3 group">
                                <img src="/assets/images/caremate-brand-logo.png" alt="CareMate Logo" className="h-16 w-auto object-contain" />
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

                        <div className="hidden">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8">Tải ứng dụng</h4>
                            <div className="space-y-3">
                                {['App Store', 'Google Play'].map((store) => (
                                    <div key={store} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/75 transition hover:border-brand/50 hover:bg-brand/10">
                                        {store}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-center md:text-left">
                            &copy; 2026 CareMate. Luxury Care Experience.
                        </div>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                social.href ? (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Facebook CareMate"
                                        className="h-11 w-11 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-brand transition-all cursor-pointer group"
                                    >
                                        <span className="text-[10px] font-black group-hover:scale-110 transition-transform">{social.label}</span>
                                    </a>
                                ) : (
                                    <div key={social.label} className="h-11 w-11 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-brand transition-all cursor-pointer group">
                                        <span className="text-[10px] font-black group-hover:scale-110 transition-transform">{social.label}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
