import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import authApi from '../api/authApi';
import { useToast } from '../hooks/useToast';

const ForgotPasswordPage = () => {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        try {
            setLoading(true);
            await authApi.forgotPassword(email);
            setSent(true);
            showToast('Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.', 'success');
        } catch {
            showToast('Không thể gửi yêu cầu. Vui lòng kiểm tra lại email.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                <div className="bg-white rounded-xl p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
                    {sent ? (
                        <div className="text-center py-8">
                            <div className="h-20 w-20 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-8">
                                <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">Đã gửi email!</h2>
                            <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <br />
                                <span className="text-brand font-black">{email}</span>. 
                                Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).
                            </p>
                            <Link to="/login" className="btn-primary !px-12">
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors mb-8">
                                <ArrowLeftIcon className="h-3 w-3" />
                                Quay lại
                            </Link>

                            <h1 className="text-3xl font-black text-slate-900 mb-4">Quên mật khẩu?</h1>
                            <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                                Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email đăng ký</label>
                                    <div className="relative group">
                                        <EnvelopeIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="example@email.com"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-lg py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary !py-5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Đang gửi...
                                        </span>
                                    ) : (
                                        'Gửi yêu cầu đặt lại'
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
