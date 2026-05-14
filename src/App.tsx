import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ToastProvider } from './contexts/ToastProvider';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import CommunityPage from './pages/CommunityPage';
import Login from './pages/Login';
import Register from './pages/Register';
import NurseProfile from './pages/NurseProfile';
import AdminLayout from './components/AdminLayout';
import NurseLayout from './components/NurseLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminPendingNurses from './pages/AdminPendingNurses';
import AdminNurseDetail from './pages/AdminNurseDetail';
import AdminUsers from './pages/AdminUsers';
import AdminBookings from './pages/AdminBookings';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import DiscoverNursesPage from './pages/DiscoverNursesPage';
import ServicesPage from './pages/ServicesPage';
import CustomerBookingsPage from './pages/CustomerBookingsPage';
import NurseSchedulePage from './pages/NurseSchedulePage';
import NurseBookingsPage from './pages/NurseBookingsPage';
import NurseServicesPage from './pages/NurseServicesPage';
import NotificationsPage from './pages/NotificationsPage';
import NursePublicDetailPage from './pages/NursePublicDetailPage';
import BookingDetailPage from './pages/BookingDetailPage';
import NurseWorkspacePage from './pages/NurseWorkspacePage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HealthCheckInsPage from './pages/HealthCheckInsPage';

import { NotificationProvider } from './contexts/NotificationProvider';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<AboutUs />} />
                <Route path="community" element={<CommunityPage />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="find-nurse" element={<DiscoverNursesPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
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
                <Route path="reports" element={<AdminReports />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
