import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRightIcon, LockClosedIcon, EnvelopeIcon, SparklesIcon,
    UserGroupIcon, ShieldCheckIcon, UserIcon, BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/apiError';

const rememberedLoginKey = 'caremateRememberedLogin';

const BrandPanel = ({ mode }: { mode: 'login' | 'register' }) => (
    <div className="hidden lg:flex flex-col justify-between p-12 lg:p-14 bg-[#111827] text-white relative h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-transparent opacity-60"></div>
        <div className={`absolute ${mode === 'login' ? 'bottom-0 right-0' : 'bottom-0 left-0'} w-80 h-80 bg-brand/10 blur-[100px] rounded-full`}></div>
        <div className="absolute top-20 right-10 grid grid-cols-6 gap-2 opacity-[0.04]">
            {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-white rounded-full" />
            ))}
        </div>
        <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 group">
                <img src="/assets/images/caremate-brand-logo.png" alt="CareMate Logo" className="h-24 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>
            <div className="mt-20">
                {mode === 'login' ? (
                    <>
                        <h2 className="text-5xl font-black leading-tight text-white">Chào mừng <br /> bạn quay trở lại</h2>
                        <p className="mt-6 text-white/40 font-medium leading-relaxed max-w-sm">Tiếp tục hành trình chăm sóc và kết nối yêu thương cùng cộng đồng CareMate chuyên nghiệp.</p>
                    </>
                ) : (
                    <>
                        <h2 className="text-4xl font-black leading-tight text-white">Bắt đầu hành trình <br /> chăm sóc chuyên nghiệp</h2>
                        <p className="mt-6 text-white/40 font-medium leading-relaxed max-w-sm">Gia nhập cộng đồng CareMate để trải nghiệm dịch vụ chăm sóc mẹ và bé tận tâm nhất.</p>
                    </>
                )}
            </div>
        </div>
        {mode === 'login' ? (
            <div className="relative z-10 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                <SparklesIcon className="h-3.5 w-3.5 text-brand" />
                <span className="h-px w-8 bg-white/10"></span>
                Chăm sóc tận tâm &mdash; kết nối yêu thương
            </div>
        ) : (
            <div className="relative z-10 flex gap-6">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <UserGroupIcon className="h-5 w-5 text-brand" /> 10k+ Khách hàng
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <ShieldCheckIcon className="h-5 w-5 text-brand" /> Xác minh 100%
                </div>
            </div>
        )}
    </div>
);

const AuthPage = () => {
    const { login, register } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'register'>(window.location.pathname.includes('/register') ? 'register' : 'login');

    // Login state
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [rememberPassword, setRememberPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Register state
    const [registerForm, setRegisterForm] = useState({
        fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer',
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === 'login') {
            const remembered = localStorage.getItem(rememberedLoginKey);
            if (!remembered) return;
            try {
                const parsed = JSON.parse(remembered) as Partial<typeof loginForm>;
                if (typeof parsed.email === 'string' && typeof parsed.password === 'string') {
                    setLoginForm({ email: parsed.email, password: parsed.password });
                    setRememberPassword(true);
                }
            } catch {
                localStorage.removeItem(rememberedLoginKey);
            }
        }
    }, [mode]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login({ ...loginForm, username: loginForm.email });
            if (rememberPassword) {
                localStorage.setItem(rememberedLoginKey, JSON.stringify(loginForm));
            } else {
                localStorage.removeItem(rememberedLoginKey);
            }
            showToast(`Chào mừng ${user.username} quay trở lại!`, 'success');
            if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role.startsWith('nurse')) navigate('/nurse/overview');
            else navigate('/');
        } catch (err) {
            showToast(getErrorMessage(err, 'Email hoặc mật khẩu không chính xác.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (registerForm.password !== registerForm.confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp.', 'error');
            return;
        }
        setLoading(true);
        try {
            const payload = registerForm.role === 'nurse'
                ? { fullName: registerForm.fullName, username: registerForm.email, email: registerForm.email, phone: registerForm.phone, password: registerForm.password, bio: '', yearsExperience: 0, serviceRadiusKm: 10 }
                : { fullName: registerForm.fullName, username: registerForm.email, email: registerForm.email, phone: registerForm.phone, password: registerForm.password, role: 'customer' as const };
            await register(payload, registerForm.role);
            showToast('Đăng ký thành công! Hãy đăng nhập.', 'success');
            navigate('/login');
        } catch (err) {
            showToast(getErrorMessage(err, 'Email đã tồn tại hoặc có lỗi xảy ra.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => setMode(mode === 'login' ? 'register' : 'login');

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6 md:py-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-brand/5 rounded-full blur-[120px] -z-10"></div>

            <motion.div
                layout
                className="w-full max-w-[1000px] min-h-[620px] lg:min-h-[700px] grid lg:grid-cols-2 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-2xl"
            >
                <AnimatePresence mode="popLayout">
                    {mode === 'login' ? (
                        <>
                            <motion.div
                                key="form"
                                layout
                                initial={{ x: -60, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -60, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="p-6 sm:p-8 lg:p-16 bg-white flex flex-col justify-center"
                            >
                                <div className="max-w-sm mx-auto">
                                    <Link to="/" className="lg:hidden flex items-center justify-center mb-6">
                                        <img src="/assets/images/logo.png" alt="CareMate" className="h-12 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    </Link>
                                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Đăng nhập</h1>
                                    <p className="mt-3 text-sm font-bold text-slate-400">
                                        Chưa có tài khoản?{' '}
                                        <button type="button" onClick={toggleMode} className="text-brand font-black hover:underline cursor-pointer">Đăng ký ngay</button>
                                    </p>
                                    <form onSubmit={handleLogin} className="mt-8 sm:mt-10 space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email tài khoản</label>
                                                <div className="relative group">
                                                    <EnvelopeIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 group-focus-within:text-brand transition-colors" />
                                                    <input type="email" className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/[0.06]" placeholder="your@email.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mật khẩu</label>
                                                    <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-brand transition-colors">Quên mật khẩu?</Link>
                                                </div>
                                                <div className="relative group">
                                                    <LockClosedIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 group-focus-within:text-brand transition-colors" />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-brand transition-colors z-10">{showPassword ? 'Ẩn' : 'Hiện'}</button>
                                                    <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3.5 pl-11 pr-14 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/[0.06]" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
                                                </div>
                                            </div>
                                            <label className="flex cursor-pointer items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-brand">
                                                <input type="checkbox" checked={rememberPassword} onChange={(e) => setRememberPassword(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/20 transition-all" />
                                                <span>Lưu mật khẩu</span>
                                            </label>
                                        </div>
                                        <button type="submit" disabled={loading} className="btn-primary w-full !py-4 !rounded-xl !text-[11px] !font-black !uppercase !tracking-[0.2em] shadow-lg shadow-pink-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95">
                                            {loading ? (
                                                <span className="flex items-center gap-3">
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                                    Đang xác thực...
                                                </span>
                                            ) : (<>Đăng nhập ngay<ArrowRightIcon className="h-4 w-4" /></>)}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                            <motion.div
                                key="brand"
                                layout
                                initial={{ x: 60, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 60, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full"
                            >
                                <BrandPanel mode="login" />
                            </motion.div>
                        </>
                    ) : (
                        <>
                            <motion.div
                                key="brand"
                                layout
                                initial={{ x: -60, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -60, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full"
                            >
                                <BrandPanel mode="register" />
                            </motion.div>
                            <motion.div
                                key="form"
                                layout
                                initial={{ x: 60, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 60, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="p-6 sm:p-8 lg:p-16 bg-white flex flex-col justify-center"
                            >
                                <div className="max-w-sm mx-auto">
                                    <Link to="/" className="lg:hidden flex items-center justify-center mb-6">
                                        <img src="/assets/images/logo.png" alt="CareMate" className="h-12 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    </Link>
                                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Tạo tài khoản</h1>
                                    <p className="mt-3 text-sm font-bold text-slate-500">
                                        Bạn đã có tài khoản?{' '}
                                        <button type="button" onClick={toggleMode} className="text-brand font-black hover:underline cursor-pointer">Đăng nhập</button>
                                    </p>
                                    <form onSubmit={handleRegister} className="mt-6 sm:mt-8 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bạn là ai?</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button type="button" onClick={() => setRegisterForm({ ...registerForm, role: 'customer' })} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${registerForm.role === 'customer' ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:border-slate-200'}`}><UserIcon className="h-4 w-4" /> Khách hàng</button>
                                                <button type="button" onClick={() => setRegisterForm({ ...registerForm, role: 'nurse' })} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${registerForm.role === 'nurse' ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:border-slate-200'}`}><BriefcaseIcon className="h-4 w-4" /> Y tá</button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Họ và tên</label>
                                            <input type="text" className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/[0.06]" placeholder="Nguyễn Văn A" value={registerForm.fullName} onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })} required />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
                                                <input type="email" className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/[0.06]" placeholder="your@email.com" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số điện thoại</label>
                                                <input type="tel" className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/[0.06]" placeholder="09xx xxx xxx" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} required />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mật khẩu</label>
                                                <input type="password" className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/[0.06]" placeholder="••••••••" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Xác nhận</label>
                                                <input type="password" className={`w-full bg-slate-50 border-2 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:ring-4 focus:ring-brand/[0.06] ${registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword ? 'border-red-200 focus:border-red-300 bg-red-50' : 'border-transparent focus:bg-white focus:border-brand/20'}`} placeholder="••••••••" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} required />
                                            </div>
                                        </div>
                                        {registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-bold text-red-400">Mật khẩu xác nhận không khớp</motion.p>
                                        )}
                                        <button type="submit" disabled={loading} className="btn-primary w-full !py-4 !rounded-xl !text-[11px] !font-black !uppercase !tracking-[0.2em] shadow-lg shadow-pink-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95">
                                            {loading ? (
                                                <span className="flex items-center gap-3">
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                                    Đang xử lý...
                                                </span>
                                            ) : (<>Đăng ký ngay<ArrowRightIcon className="h-4 w-4" /></>)}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default AuthPage;
