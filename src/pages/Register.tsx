import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, UserGroupIcon, ShieldCheckIcon, UserIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/apiError';

const Register = () => {
    const { register } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp.', 'error');
            return;
        }

        setLoading(true);
        try {
            const payload =
                form.role === 'nurse'
                    ? {
                          fullName: form.fullName,
                          username: form.email,
                          email: form.email,
                          phone: form.phone,
                          password: form.password,
                          bio: '',
                          yearsExperience: 0,
                          serviceRadiusKm: 10,
                      }
                    : {
                          fullName: form.fullName,
                          username: form.email,
                          email: form.email,
                          phone: form.phone,
                          password: form.password,
                          role: 'customer' as const,
                      };

            await register(payload, form.role);
            showToast('Đăng ký thành công! Hãy đăng nhập.', 'success');
            navigate('/login');
        } catch (err) {
            showToast(getErrorMessage(err, 'Email đã tồn tại hoặc có lỗi xảy ra.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 py-10 lg:py-20 overflow-hidden">
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-[1000px] h-[800px] bg-brand/5 rounded-full blur-[120px] -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[1000px] min-h-[620px] lg:min-h-[700px] grid lg:grid-cols-2 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-2xl"
            >
                <div className="hidden lg:flex flex-col justify-between p-14 bg-[#111827] text-white relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand/10 blur-[100px] rounded-full"></div>
                    <div className="absolute top-20 right-10 grid grid-cols-6 gap-2 opacity-[0.04]">
                        {Array.from({ length: 36 }).map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-white rounded-full" />
                        ))}
                    </div>
                    <div className="relative z-10">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img src="/assets/images/caremate-brand-logo.png" alt="CareMate Logo" className="h-24 w-auto object-contain transition-transform group-hover:scale-105" />
                        </Link>
                        <div className="mt-16">
                            <h2 className="text-4xl font-black leading-tight text-white">Bắt đầu hành trình <br /> chăm sóc chuyên nghiệp</h2>
                            <p className="mt-6 text-white/40 font-medium leading-relaxed max-w-sm">
                                Gia nhập cộng đồng CareMate để trải nghiệm dịch vụ chăm sóc mẹ và bé tận tâm nhất.
                            </p>
                        </div>
                    </div>
                    <div className="relative z-10 flex gap-6">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <UserGroupIcon className="h-5 w-5 text-brand" /> 10k+ Khách hàng
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <ShieldCheckIcon className="h-5 w-5 text-brand" /> Xác minh 100%
                        </div>
                    </div>
                </div>

                <div className="p-8 sm:p-12 lg:p-16 bg-white flex flex-col justify-center">
                    <div className="max-w-sm mx-auto">
                        <Link to="/" className="lg:hidden flex items-center justify-center mb-8">
                            <img src="/assets/images/logo.png" alt="CareMate" className="h-12 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Tạo tài khoản</h1>
                        <p className="mt-3 text-sm font-bold text-slate-500">
                            Bạn đã có tài khoản?{' '}
                            <Link to="/login" className="text-brand font-black hover:underline">Đăng nhập</Link>
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bạn là ai?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, role: 'customer' })}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                                            form.role === 'customer'
                                                ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                                                : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:border-slate-200'
                                        }`}
                                    >
                                        <UserIcon className="h-4 w-4" />
                                        Khách hàng
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, role: 'nurse' })}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                                            form.role === 'nurse'
                                                ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                                                : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:border-slate-200'
                                        }`}
                                    >
                                        <BriefcaseIcon className="h-4 w-4" />
                                        Y tá
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Họ và tên</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/[0.06]"
                                    placeholder="Nguyễn Văn A"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/[0.06]"
                                        placeholder="your@email.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/[0.06]"
                                        placeholder="09xx xxx xxx"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mật khẩu</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/[0.06]"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Xác nhận</label>
                                    <input
                                        type="password"
                                        className={`w-full bg-slate-50 border-2 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition-all duration-300 focus:ring-4 focus:ring-brand/[0.06] ${
                                            form.confirmPassword && form.password !== form.confirmPassword
                                                ? 'border-red-200 focus:border-red-300 bg-red-50'
                                                : 'border-transparent focus:bg-white focus:border-brand/20'
                                        }`}
                                        placeholder="••••••••"
                                        value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {form.confirmPassword && form.password !== form.confirmPassword && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[10px] font-bold text-red-400"
                                >
                                    Mật khẩu xác nhận không khớp
                                </motion.p>
                            )}

                            <button type="submit" disabled={loading} className="btn-primary w-full !py-4 !rounded-xl !text-[11px] !font-black !uppercase !tracking-[0.2em] shadow-lg shadow-pink-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95">
                                {loading ? (
                                    <span className="flex items-center gap-3">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Đang xử lý...
                                    </span>
                                ) : (
                                    <>
                                        Đăng ký ngay
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

export default Register;
