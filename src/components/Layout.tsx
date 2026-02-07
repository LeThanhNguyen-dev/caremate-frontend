import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="layout">
            <header className="header">
                <div className="header-container">
                    <Link to="/" className="logo">
                        <span className="logo-icon">💜</span>
                        <span className="logo-text">CareMate</span>
                    </Link>

                    <nav className="nav">
                        {isAuthenticated ? (
                            <>
                                <Link to="/" className="nav-link">Trang chủ</Link>
                                <div className="user-menu">
                                    <span className="user-info">
                                        Xin chào, <strong>{user?.username}</strong>
                                        <span className="user-role">({user?.role})</span>
                                    </span>
                                    <button onClick={handleLogout} className="btn btn-logout">
                                        Đăng xuất
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link">Đăng nhập</Link>
                                <Link to="/register" className="btn btn-primary">Đăng ký</Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="footer">
                <div className="footer-container">
                    <p>&copy; 2026 CareMate - Chăm sóc mẹ và bé</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
