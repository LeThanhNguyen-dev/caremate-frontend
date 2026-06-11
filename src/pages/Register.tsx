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
            showToast('Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p.', 'error');
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
            showToast('ÄÄƒng kÃ½ thÃ nh cÃ´ng! HÃ£y Ä‘Äƒng nháº­p.', 'success');
            navigate('/login');
        } catch (err) {
            showToast(getErrorMessage(err, 'Email Ä‘Ã£ tá»“n táº¡i hoáº·c cÃ³ lá»—i xáº£y ra.'), 'error');
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
                            <img src="/assets/images/logo-new-transparent.png" alt="CareMate Logo" className="h-48 w-auto object-contain transition-transform group-hover:scale-105" />
                        </Link>
                        <div className="mt-24">
                            <h2 className="text-4xl font-black leading-tight">Báº¯t Ä‘áº§u hÃ nh trÃ¬nh <br /> chÄƒm sÃ³c chuyÃªn nghiá»‡p</h2>
                            <p className="mt-6 text-white/50 font-medium leading-relaxed max-w-sm">
                                Gia nháº­p cá»™ng Ä‘á»“ng CareMate Ä‘á»ƒ tráº£i nghiá»‡m dá»‹ch vá»¥ chÄƒm sÃ³c máº¹ vÃ  bÃ© táº­n tÃ¢m nháº¥t Viá»‡t Nam.
                            </p>
                        </div>
                    </div>
                    <div className="relative z-10 flex gap-6">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <UserGroupIcon className="h-5 w-5 text-brand" /> 10k+ KhÃ¡ch hÃ ng
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <ShieldCheckIcon className="h-5 w-5 text-brand" /> XÃ¡c minh 100%
                        </div>
                    </div>
                </div>

                <div className="p-10 sm:p-16 bg-white">
                    <div className="max-w-sm mx-auto">
                        <h1 className="text-3xl font-black text-slate-900">Táº¡o tÃ i khoáº£n</h1>
                        <p className="mt-3 text-sm font-bold text-slate-500">
                            Báº¡n Ä‘Ã£ cÃ³ tÃ i khoáº£n?{' '}
                            <Link to="/login" className="text-brand font-black hover:underline">ÄÄƒng nháº­p</Link>
                        </p>

                        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                            <div>
                                <label className="form-label">Báº¡n lÃ  ai?</label>
                                <div className="mt-2 grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setForm({ ...form, role: 'customer' })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.role === 'customer' ? 'bg-brand text-white shadow-lg shadow-pink-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                        KhÃ¡ch hÃ ng
                                    </button>
                                    <button type="button" onClick={() => setForm({ ...form, role: 'nurse' })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.role === 'nurse' ? 'bg-brand text-white shadow-lg shadow-pink-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                        Y tÃ¡ / Äiá»u dÆ°á»¡ng
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Há» vÃ  tÃªn</label>
                                <input type="text" className="form-input" placeholder="Nguyá»…n VÄƒn A" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                            </div>

                            <div>
                                <label className="form-label">Email</label>
                                <input type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            </div>

                            <div>
                                <label className="form-label">Sá»‘ Ä‘iá»‡n thoáº¡i</label>
                                <input type="tel" className="form-input" placeholder="09xx xxx xxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Máº­t kháº©u</label>
                                    <input type="password" className="form-input" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="form-label">XÃ¡c nháº­n</label>
                                    <input type="password" className="form-input" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-500/20 flex items-center justify-center gap-3">
                                {loading ? 'Äang xá»­ lÃ½...' : 'ÄÄƒng kÃ½ ngay'}
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
