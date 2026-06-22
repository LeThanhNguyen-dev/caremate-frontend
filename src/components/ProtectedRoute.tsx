import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import { useTranslation } from 'react-i18next';
interface ProtectedRouteProps { children: React.ReactNode; allowedRoles?: string[];
} const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => { const { isAuthenticated, isLoading, user } = useAuth(); const location = useLocation(); const { t } = useTranslation(); if (isLoading) { return ( <div className="flex items-center justify-center min-h-[400px]"> <div className="flex flex-col items-center gap-3"> <div className="spinner"></div> <p className="text-sm text-slate-500">{t('common.loading')}</p> </div> </div> ); } if (!isAuthenticated) { return <Navigate to="/login" state={{ from: location }} replace />; } if (allowedRoles && user && !allowedRoles.includes(user.role)) { return <Navigate to="/" replace />; } return <>{children}</>;
}; export default ProtectedRoute; 
