import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LockClosedIcon, ArrowLeftIcon, CheckCircleIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import authApi from '../api/authApi';
import { useToast } from '../hooks/useToast';

const ResetPasswordPage = () => {
    const { showToast } = useToast();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const emailParam = searchParams.get('email') || '';
    const tokenParam = searchParams.get('token') || '';

    const [form, setForm] = useState({
        email: emailParam,
        token: tokenParam,
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            showToast(t('toast.passwordMismatch'), 'error');
            return;
        }
        if (form.newPassword.length < 6) {
            showToast(t('toast.passwordLength'), 'error');
            return;
        }

        try {
            setLoading(true);
            await authApi.resetPassword({
                email: form.email,
                token: form.token,
                newPassword: form.newPassword,
            });
            setSuccess(true);
            showToast(t('toast.resetSuccess'), 'success');
        } catch {
            showToast(t('toast.resetError'), 'error');
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
                    {success ? (
                        <div className="text-center py-8">
                            <div className="h-20 w-20 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-8">
                                <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">{t('resetPassword.successTitle')}</h2>
                            <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                                {t('resetPassword.successDesc')}
                            </p>
                            <button onClick={() => navigate('/login')} className="btn-primary !px-12">
                                {t('resetPassword.loginNowBtn')}
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors mb-8">
                                <ArrowLeftIcon className="h-3 w-3" />
                                {t('resetPassword.backToLogin')}
                            </Link>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-14 w-14 rounded-xl bg-brand/5 flex items-center justify-center">
                                    <KeyIcon className="h-7 w-7 text-brand" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900">{t('resetPassword.title')}</h1>
                                    <p className="text-sm font-medium text-slate-400 mt-1">{t('resetPassword.subtitle')}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {!emailParam && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('resetPassword.emailLabel')}</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="example@email.com"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all"
                                        />
                                    </div>
                                )}
                                {!tokenParam && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('resetPassword.tokenLabel')}</label>
                                        <input
                                            type="text"
                                            value={form.token}
                                            onChange={(e) => setForm({ ...form, token: e.target.value })}
                                            placeholder={t('resetPassword.tokenPlaceholder')}
                                            required
                                            className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all"
                                        />
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('resetPassword.newPasswordLabel')}</label>
                                    <div className="relative group">
                                        <LockClosedIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                        <input
                                            type="password"
                                            value={form.newPassword}
                                            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                            placeholder={t('resetPassword.newPasswordPlaceholder')}
                                            required
                                            minLength={6}
                                            className="w-full bg-slate-50 border-none rounded-xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('resetPassword.confirmPasswordLabel')}</label>
                                    <div className="relative group">
                                        <LockClosedIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                        <input
                                            type="password"
                                            value={form.confirmPassword}
                                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                            placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                                            required
                                            minLength={6}
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
                                            {t('resetPassword.processing')}
                                        </span>
                                    ) : (
                                        t('resetPassword.resetBtn')
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

export default ResetPasswordPage;
