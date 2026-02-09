import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isLoginPage = location.pathname === '/login';
    const isRegisterPage = location.pathname === '/register';

    return (
        <div className="layout">
            <header className="header">
                <div className="header-container">
                    <Link to="/" className="logo">
                        <span className="logo-text">CareMate</span>
                    </Link>

                    <nav className="nav">
                        <Link to="/find-nurse" className="nav-link">Tìm điều dưỡng</Link>
                        <Link to="/services" className="nav-link">Dịch vụ</Link>
                        <Link to="/about" className="nav-link">Về chúng tôi</Link>

                        {isAuthenticated ? (
                            
                            <div className="user-menu">
                                <span className="user-info">
                                    Xin chào, <strong>{user?.username}</strong>
                                </span>
                                <button onClick={handleLogout} className="btn btn-logout">
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className={`btn btn-auth ${isLoginPage ? 'active' : ''}`}>
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className={`btn btn-auth ${isRegisterPage ? 'active' : ''}`}>
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="footer">
                <div className="footer-container">
                    <span className="footer-copyright">© 2024 CareMate Inc. Dữ liệu được mã hóa an toàn.</span>
                    <div className="footer-links">
                        <Link to="/privacy">Chính sách bảo mật</Link>
                        <Link to="/terms">Điều khoản dịch vụ</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
