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
            <div
                style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    pointerEvents: 'none',
                    maxWidth: '400px',
                }}
            >
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 80, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 80, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`${colorMap[toast.type]} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 pointer-events-auto`}
                            style={{ minWidth: '300px' }}
                        >
                            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-black shrink-0">
                                {icons[toast.type]}
                            </div>
                            <span className="text-sm font-bold leading-snug">{toast.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
