import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { trackPageView } from './hooks/useAnalytics';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthProvider';
import { ToastProvider } from './contexts/ToastProvider';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import FloatingChatbot from './components/FloatingChatbot';

const AdminLayout = lazy(() => import('./components/AdminLayout'));
const NurseLayout = lazy(() => import('./components/NurseLayout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminPendingNurses = lazy(() => import('./pages/AdminPendingNurses'));
const AdminNurseDetail = lazy(() => import('./pages/AdminNurseDetail'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminBookings = lazy(() => import('./pages/AdminBookings'));
const AdminReports = lazy(() => import('./pages/AdminReports'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminFinance = lazy(() => import('./pages/AdminFinance'));
const AdminAuditLogs = lazy(() => import('./pages/AdminAuditLogs'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const NurseProfile = lazy(() => import('./pages/NurseProfile'));
const DiscoverNursesPage = lazy(() => import('./pages/DiscoverNursesPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const CustomerBookingsPage = lazy(() => import('./pages/CustomerBookingsPage'));
const NurseSchedulePage = lazy(() => import('./pages/NurseSchedulePage'));
const NurseBookingsPage = lazy(() => import('./pages/NurseBookingsPage'));
const NurseServicesPage = lazy(() => import('./pages/NurseServicesPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const NursePublicDetailPage = lazy(() => import('./pages/NursePublicDetailPage'));
const BookingDetailPage = lazy(() => import('./pages/BookingDetailPage'));
const NurseWorkspacePage = lazy(() => import('./pages/NurseWorkspacePage'));
const CustomerProfilePage = lazy(() => import('./pages/CustomerProfilePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const HealthCheckInsPage = lazy(() => import('./pages/HealthCheckInsPage'));
const PaymentResultPage = lazy(() => import('./pages/PaymentResultPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

import { NotificationProvider } from './contexts/NotificationProvider';
import { ChatbotProvider } from './contexts/ChatbotProvider';

const PageViewTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);
  return null;
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 2 } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <ChatbotProvider>
              <BrowserRouter>
                <ScrollToTop />
                <PageViewTracker />
                <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white"><div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div>}>
                  <Routes>
                    {/* Public Layout */}
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="about" element={<AboutUs />} />
                      <Route path="community" element={<CommunityPage />} />
                      <Route path="login" element={<AuthPage />} />
                      <Route path="register" element={<AuthPage />} />
                      <Route path="find-nurse" element={<DiscoverNursesPage />} />
                      <Route path="services" element={<ServicesPage />} />
                      <Route path="services/:serviceId" element={<ServiceDetailPage />} />
                      <Route path="forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="reset-password" element={<ResetPasswordPage />} />
                      <Route path="payment/success" element={<PaymentResultPage />} />
                      <Route path="payment/cancel" element={<PaymentResultPage />} />
                      <Route path="nurses/:userId" element={<NursePublicDetailPage />} />

                      {/* Customer Routes */}
                      <Route
                        path="profile"
                        element={
                          <ProtectedRoute allowedRoles={['customer', 'admin']}>
                            <CustomerProfilePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="my-bookings"
                        element={
                          <ProtectedRoute allowedRoles={['customer', 'admin']}>
                            <CustomerBookingsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="health-checkins"
                        element={
                          <ProtectedRoute allowedRoles={['customer', 'admin']}>
                            <HealthCheckInsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bookings/:id"
                        element={
                          <ProtectedRoute>
                            <BookingDetailPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="notifications"
                        element={
                          <ProtectedRoute>
                            <NotificationsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="chat"
                        element={
                          <ProtectedRoute>
                            <ChatPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="chat/bookings/:bookingId"
                        element={
                          <ProtectedRoute>
                            <ChatPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>

                    {/* Nurse Layout */}
                    <Route
                      path="/nurse"
                      element={
                        <ProtectedRoute allowedRoles={['nurse', 'nurse_unconfirmed', 'nurse_confirmed']}>
                          <NurseLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to="overview" replace />} />
                      <Route path="overview" element={<NurseWorkspacePage />} />
                      <Route path="profile" element={<NurseProfile />} />
                      <Route path="workspace" element={<Navigate to="/nurse/overview" replace />} />
                      <Route path="schedule" element={<NurseSchedulePage />} />
                      <Route path="bookings" element={<NurseBookingsPage />} />
                      <Route path="services" element={<NurseServicesPage />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="chat" element={<ChatPage />} />
                      <Route path="*" element={<Navigate to="/nurse/overview" replace />} />
                    </Route>

                    {/* Admin Layout */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="pending-nurses" element={<AdminPendingNurses />} />
                      <Route path="nurses/:id" element={<AdminNurseDetail />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="bookings" element={<AdminBookings />} />
                      <Route path="finance" element={<AdminFinance />} />
                      <Route path="audit-logs" element={<AdminAuditLogs />} />
                      <Route path="reports" element={<AdminReports />} />
                      <Route path="chat" element={<ChatPage />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Route>
                  </Routes>
                </Suspense>
                <FloatingChatbot />
              </BrowserRouter>
            </ChatbotProvider>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
