import { useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, LockClosedIcon, EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/apiError';

const rememberedLoginKey = 'caremateRememberedLogin';

const Login = () => {
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
    });
    const [rememberPassword, setRememberPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const rememberedLogin = localStorage.getItem(rememberedLoginKey);
        if (!rememberedLogin) return;

        try {
            const parsed = JSON.parse(rememberedLogin) as Partial<typeof form>;
            if (typeof parsed.email === 'string' && typeof parsed.password === 'string') {
                setForm({
                    email: parsed.email,
                    password: parsed.password,
                });
                setRememberPassword(true);
            }
        } catch {
            localStorage.removeItem(rememberedLoginKey);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login({
                ...form,
                username: form.email,
            });

            if (rememberPassword) {
                localStorage.setItem(rememberedLoginKey, JSON.stringify(form));
            } else {
                localStorage.removeItem(rememberedLoginKey);
            }

            showToast(`Chào mừng ${user.username} quay trở lại!`, 'success');

            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role.startsWith('nurse')) {
                navigate('/nurse/overview');
            } else {
                navigate('/');
            }
        } catch (err) {
            showToast(getErrorMessage(err, 'Email hoặc mật khẩu không chính xác.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 py-10 lg:py-20 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-brand/5 rounded-full blur-[120px] -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[1000px] min-h-[620px] lg:min-h-[700px] grid lg:grid-cols-2 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-2xl"
            >
                <div className="hidden lg:flex flex-col justify-between p-14 bg-[#111827] text-white relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand/10 blur-[100px] rounded-full"></div>
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
                            <h2 className="text-5xl font-black leading-tight text-white">Chào mừng <br /> bạn quay trở lại</h2>
                            <p className="mt-6 text-white/40 font-medium leading-relaxed max-w-sm">Tiếp tục hành trình chăm sóc và kết nối yêu thương cùng cộng đồng CareMate chuyên nghiệp.</p>
                        </div>
                    </div>
                    <div className="relative z-10 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <SparklesIcon className="h-3.5 w-3.5 text-brand" />
                        <span className="h-px w-8 bg-white/10"></span>
                        Chăm sóc tận tâm &mdash; kết nối yêu thương
                    </div>
                </div>

                <div className="p-8 sm:p-12 lg:p-16 bg-white flex flex-col justify-center">
                    <div className="max-w-sm mx-auto">
                        <Link to="/" className="lg:hidden flex items-center justify-center mb-8">
                            <img src="/assets/images/logo.png" alt="CareMate" className="h-12 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Đăng nhập</h1>
                        <p className="mt-3 text-sm font-bold text-slate-400">Chưa có tài khoản? <Link to="/register" className="text-brand font-black hover:underline">Đăng ký ngay</Link></p>

                        <form onSubmit={handleSubmit} className="mt-8 sm:mt-10 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email tài khoản</label>
                                    <div className="relative group">
                                        <EnvelopeIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 group-focus-within:text-brand transition-colors" />
                                        <input
                                            type="email"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/[0.06]"
                                            placeholder="your@email.com"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mật khẩu</label>
                                        <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-brand transition-colors">Quên mật khẩu?</Link>
                                    </div>
                                    <div className="relative group">
                                        <LockClosedIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 group-focus-within:text-brand transition-colors" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-brand transition-colors z-10"
                                        >
                                            {showPassword ? 'Ẩn' : 'Hiện'}
                                        </button>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3.5 pl-11 pr-14 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/[0.06]"
                                            placeholder="••••••••"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <label className="flex cursor-pointer items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-brand">
                                    <input
                                        type="checkbox"
                                        checked={rememberPassword}
                                        onChange={(e) => setRememberPassword(e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/20 transition-all"
                                    />
                                    <span>Lưu mật khẩu</span>
                                </label>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full !py-4 !rounded-xl !text-[11px] !font-black !uppercase !tracking-[0.2em] shadow-lg shadow-pink-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95">
                                {loading ? (
                                    <span className="flex items-center gap-3">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Đang xác thực...
                                    </span>
                                ) : (
                                    <>
                                        Đăng nhập ngay
                                        <ArrowRightIcon className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
