import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Chào mừng đến với <span className="highlight">CareMate</span>
                    </h1>
                    <p className="hero-subtitle">
                        Nền tảng kết nối mẹ bầu với dịch vụ chăm sóc sức khỏe chuyên nghiệp
                    </p>

                    {isAuthenticated ? (
                        <div className="welcome-card">
                            <div className="welcome-icon">👋</div>
                            <h2>Xin chào, {user?.username}!</h2>
                            <p className="user-role-badge">
                                {user?.role === 'nurse' ? '🏥 Điều dưỡng' : '👩‍👧 Khách hàng'}
                            </p>
                        </div>
                    ) : (
                        <div className="cta-buttons">
                            <a href="/register" className="cta-btn primary">
                                Bắt đầu ngay
                            </a>
                            <a href="/login" className="cta-btn secondary">
                                Đăng nhập
                            </a>
                        </div>
                    )}
                </div>

                <div className="hero-illustration">
                    <div className="floating-card card-1">
                        <span>💜</span>
                        <p>Chăm sóc tận tâm</p>
                    </div>
                    <div className="floating-card card-2">
                        <span>👶</span>
                        <p>An toàn cho bé</p>
                    </div>
                    <div className="floating-card card-3">
                        <span>🏥</span>
                        <p>Chuyên gia y tế</p>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <h2 className="section-title">Dịch vụ của chúng tôi</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🤰</div>
                        <h3>Chăm sóc thai kỳ</h3>
                        <p>Theo dõi sức khỏe mẹ và bé trong suốt thai kỳ</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">👩‍⚕️</div>
                        <h3>Y tá tận nhà</h3>
                        <p>Đội ngũ y tá chuyên nghiệp đến tận nhà phục vụ</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📅</div>
                        <h3>Đặt lịch linh hoạt</h3>
                        <p>Đặt lịch hẹn dễ dàng theo thời gian phù hợp</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>Tư vấn trực tuyến</h3>
                        <p>Chat trực tiếp với chuyên gia y tế</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
