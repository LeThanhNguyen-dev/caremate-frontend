import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/apiError';

const Login = () => {
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login({
                ...form,
                username: form.email,
            });
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
        <div className="relative min-h-[90vh] flex items-center justify-center px-6 py-20 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-brand/5 rounded-full blur-[120px] -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[1000px] grid lg:grid-cols-2 bg-white rounded-xl overflow-hidden border border-slate-100 shadow-2xl"
            >
                <div className="hidden lg:flex flex-col justify-between p-16 bg-[#111827] text-white relative">
                    <div className="absolute inset-0 bg-brand/10 blur-[100px] opacity-30"></div>
                    <div className="relative z-10">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img src="/assets/images/logo.png" alt="CareMate Logo" className="h-48 w-auto object-contain transition-transform group-hover:scale-105" />
                        </Link>
                        <div className="mt-24">
                            <h2 className="text-5xl font-black leading-tight text-white">Chào mừng <br /> bạn quay trở lại</h2>
                            <p className="mt-6 text-white/40 font-medium leading-relaxed max-w-sm">Tiếp tục hành trình chăm sóc và kết nối yêu thương cùng cộng đồng CareMate chuyên nghiệp.</p>
                        </div>
                    </div>
                    <div className="relative z-10 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <span className="h-px w-8 bg-white/10"></span> Luxury Care Experience
                    </div>
                </div>

                <div className="p-10 sm:p-20 bg-white">
                    <div className="max-w-sm mx-auto">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Đăng nhập</h1>
                        <p className="mt-4 text-sm font-bold text-slate-400">Chưa có tài khoản? <Link to="/register" className="text-brand font-black hover:underline">Đăng ký ngay</Link></p>

                        <form onSubmit={handleSubmit} className="mt-12 space-y-10">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email tài khoản</label>
                                    <div className="relative group">
                                        <EnvelopeIcon className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300 group-focus-within:text-brand transition-colors" />
                                        <input type="email" className="w-full bg-slate-50 border-none rounded-xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mật khẩu</label>
                                        <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-brand transition-colors">Quên mật khẩu?</Link>
                                    </div>
                                    <div className="relative group">
                                        <LockClosedIcon className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300 group-focus-within:text-brand transition-colors" />
                                        <input type="password" className="w-full bg-slate-50 border-none rounded-xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full !py-5 !rounded-xl !text-[11px] !font-black !uppercase !tracking-[0.2em] shadow-2xl shadow-pink-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95">
                                {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
                                {!loading && <ArrowRightIcon className="h-4 w-4" />}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
