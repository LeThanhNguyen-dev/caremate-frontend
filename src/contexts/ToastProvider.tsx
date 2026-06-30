import { useState, useCallback, type ReactNode } from 'react';
import { ToastContext, type Toast, type ToastType } from './ToastContextObject';
import { motion, AnimatePresence } from 'framer-motion';

let toastId = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const icons: Record<ToastType, string> = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
    };

    const colorMap: Record<ToastType, string> = {
        success: 'bg-emerald-600',
        error: 'bg-rose-600',
        info: 'bg-blue-600',
        warning: 'bg-amber-500',
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed left-4 right-4 top-4 z-[9999] flex flex-col gap-2 pointer-events-none sm:left-auto sm:right-6 sm:top-6 sm:max-w-[400px]">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`${colorMap[toast.type]} pointer-events-auto flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-white shadow-2xl sm:min-w-[300px] sm:px-6`}
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-sm font-black">
                                {icons[toast.type]}
                            </div>
                            <span className="text-[13px] font-bold leading-snug sm:text-sm">{toast.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
