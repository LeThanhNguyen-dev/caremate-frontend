import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import authApi from '../api/authApi';
import { useToast } from '../hooks/useToast';

const ForgotPasswordPage = () => {
    const { showToast } = useToast();
    const { t } = useTranslation();
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
            showToast(t('toast.forgotPasswordSuccess'), 'success');
        } catch {
            showToast(t('toast.forgotPasswordError'), 'error');
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
                            <h2 className="text-3xl font-black text-slate-900 mb-4">{t('forgotPassword.emailSent')}</h2>
                            <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                                <span dangerouslySetInnerHTML={{ __html: t('forgotPassword.instructionSent') }}></span>
                                <span className="text-brand font-black">{email}</span>.<br />
                                {t('forgotPassword.checkSpam')}
                            </p>
                            <Link to="/login" className="btn-primary !px-12">
                                {t('forgotPassword.backToLogin')}
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors mb-8">
                                <ArrowLeftIcon className="h-3 w-3" />
                                {t('forgotPassword.back')}
                            </Link>

                            <h1 className="text-3xl font-black text-slate-900 mb-4">{t('forgotPassword.title')}</h1>
                            <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                                {t('forgotPassword.description')}
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('forgotPassword.emailLabel')}</label>
                                    <div className="relative group">
                                        <EnvelopeIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="example@email.com"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all"
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
                                            {t('forgotPassword.sending')}
                                        </span>
                                    ) : (
                                        t('forgotPassword.sendBtn')
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
