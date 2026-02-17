import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NurseProfile from './pages/NurseProfile';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminPendingNurses from './pages/AdminPendingNurses';
import AdminNurseDetail from './pages/AdminNurseDetail';
import AdminUsers from './pages/AdminUsers';
import AdminBookings from './pages/AdminBookings';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Nurse Routes */}
            <Route
              path="nurse/profile"
              element={
                <ProtectedRoute allowedRoles={['nurse', 'nurse_unconfirmed', 'nurse_confirmed']}>
                  <NurseProfile />
                </ProtectedRoute>
              }
            />

            {/* Legacy Dashboard Redirect or example */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h1>Dashboard</h1>
                    <p>Trang này yêu cầu đăng nhập</p>
                  </div>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes with dedicated Layout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pending-nurses" element={<AdminPendingNurses />} />
            <Route path="nurses/:id" element={<AdminNurseDetail />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
