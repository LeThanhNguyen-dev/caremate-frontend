import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
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
        <div className="relative min-h-[90vh] flex items-center justify-center px-6 py-20 overflow-hidden">
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-[1000px] h-[800px] bg-brand/5 rounded-full blur-[120px] -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[1000px] grid lg:grid-cols-2 luxury-card !p-0 overflow-hidden border-none shadow-2xl"
            >
                <div className="hidden lg:flex flex-col justify-between p-16 bg-[#111827] text-white relative">
                    <div className="absolute inset-0 bg-brand/10 blur-[100px] opacity-30"></div>
                    <div className="relative z-10">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img src="/assets/images/logo-new-transparent.png" alt="CareMate Logo" className="h-28 w-auto object-contain transition-transform group-hover:scale-105" />
                        </Link>
                        <div className="mt-24">
                            <h2 className="text-4xl font-black leading-tight">Bắt đầu hành trình <br /> chăm sóc chuyên nghiệp</h2>
                            <p className="mt-6 text-white/50 font-medium leading-relaxed max-w-sm">
                                Gia nhập cộng đồng CareMate để trải nghiệm dịch vụ chăm sóc mẹ và bé tận tâm nhất Việt Nam.
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

                <div className="p-10 sm:p-16 bg-white">
                    <div className="max-w-sm mx-auto">
                        <h1 className="text-3xl font-black text-slate-900">Tạo tài khoản</h1>
                        <p className="mt-3 text-sm font-bold text-slate-500">
                            Bạn đã có tài khoản?{' '}
                            <Link to="/login" className="text-brand font-black hover:underline">Đăng nhập</Link>
                        </p>

                        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                            <div>
                                <label className="form-label">Bạn là ai?</label>
                                <div className="mt-2 grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setForm({ ...form, role: 'customer' })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.role === 'customer' ? 'bg-brand text-white shadow-lg shadow-pink-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                        Khách hàng
                                    </button>
                                    <button type="button" onClick={() => setForm({ ...form, role: 'nurse' })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.role === 'nurse' ? 'bg-brand text-white shadow-lg shadow-pink-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                        Y tá / Điều dưỡng
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Họ và tên</label>
                                <input type="text" className="form-input" placeholder="Nguyễn Văn A" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                            </div>

                            <div>
                                <label className="form-label">Email</label>
                                <input type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            </div>

                            <div>
                                <label className="form-label">Số điện thoại</label>
                                <input type="tel" className="form-input" placeholder="09xx xxx xxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Mật khẩu</label>
                                    <input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="form-label">Xác nhận</label>
                                    <input type="password" className="form-input" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-500/20 flex items-center justify-center gap-3">
                                {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
                                {!loading && <ArrowRightIcon className="h-4 w-4" />}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
