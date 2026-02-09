import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Home.css';

// SVG Icons
const ShieldCheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const HeartPulseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

const UserCheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
    </svg>
);

const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
);

const StarIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const Home = () => {
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Chăm sóc <span className="highlight">Mẹ & Bé</span> toàn diện tại nhà
                    </h1>
                    <p className="hero-subtitle">
                        Kết nối với đội ngũ điều dưỡng chuyên nghiệp, tận tâm.
                        CareMate mang đến sự an tâm tuyệt đối cho hành trình làm mẹ của bạn.
                    </p>

                    {isAuthenticated ? (
                        <div className="welcome-container">
                            <div className="user-avatar">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="welcome-info">
                                <span className="role-tag">
                                    {user?.role === 'nurse' ? 'Điều dưỡng viên' : 'Khách hàng'}
                                </span>
                                <h2>Chào mừng, {user?.username}!</h2>
                                <Link to="/find-nurse" className="text-link">Xem lịch hẹn của bạn →</Link>
                            </div>
                        </div>
                    ) : (
                        <div className="cta-buttons">
                            <Link to="/register" className="cta-btn primary">
                                Tìm điều dưỡng ngay
                            </Link>
                            <Link to="/about" className="cta-btn secondary">
                                Tìm hiểu thêm
                            </Link>
                        </div>
                    )}
                </div>

                <div className="hero-illustration">
                    <div className="illustration-wrapper">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfbkZThp-UG2BFZ1Xz1a1hOp70YCyogT3-N9_HF1AGkL_WQn5HDpW33KyVeFKO8NmtfKf9gaTmuw2bAIKYgxNfQOpezi6NIygfrUx_Pg4GCSOPm_oB3N0hZQ8ylo0Z-r4o1Ttrf_eu7CNvj3SDgMBqEFpEZgFQ5YT9F9ZZYJeiYfkNduHnUsbmKUmaR3Jm7pbdkA9-oXiqksjpXRXPRdiO3cIiDokWyrJVGx8H8zwaHQzSoDAO6UmPnBLsry7mYFCoGWvMl3AZ9_I"
                            alt="Professional maternal care"
                            className="nurse-hero-img"
                        />
                        <div className="floating-badge badge-1">
                            <div className="badge-icon"><ShieldCheckIcon /></div>
                            <span>Xác thực 100%</span>
                        </div>
                        <div className="floating-badge badge-2">
                            <div className="badge-icon"><HeartPulseIcon /></div>
                            <span>Tận tâm chu đáo</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-value">1,500+</div>
                        <div className="stat-label">Điều dưỡng viên</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">10,000+</div>
                        <div className="stat-label">Gia đình tin dùng</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">4.9/5</div>
                        <div className="stat-label">Đánh giá trung bình</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">24/7</div>
                        <div className="stat-label">Hỗ trợ y tế</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <span className="section-label">Dịch vụ vượt trội</span>
                    <h2 className="section-title">Tại sao chọn CareMate?</h2>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="f-icon-box">
                            <UserCheckIcon />
                        </div>
                        <h3>Điều dưỡng chuyên nghiệp</h3>
                        <p>Đội ngũ y tá, điều dưỡng có bằng cấp và được đào tạo chuyên sâu về chăm sóc mẹ và bé.</p>
                    </div>

                    <div className="feature-card">
                        <div className="f-icon-box">
                            <ShieldCheckIcon />
                        </div>
                        <h3>An toàn & Tin cậy</h3>
                        <p>Mọi quy trình đều tuân thủ chuẩn y khoa, đảm bảo an toàn tuyệt đối cho sức khỏe của bạn.</p>
                    </div>

                    <div className="feature-card">
                        <div className="f-icon-box">
                            <CalendarIcon />
                        </div>
                        <h3>Đặt lịch linh hoạt</h3>
                        <p>Chủ động thời gian, lựa chọn người chăm sóc phù hợp chỉ với vài thao tác đơn giản.</p>
                    </div>

                    <div className="feature-card">
                        <div className="f-icon-box">
                            <HeartPulseIcon />
                        </div>
                        <h3>Chăm sóc toàn diện</h3>
                        <p>Từ theo dõi thai kỳ đến chăm sóc trẻ sơ sinh, chúng tôi luôn đồng hành cùng gia đình bạn.</p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <div className="section-header">
                    <span className="section-label">Quy trình đơn giản</span>
                    <h2 className="section-title">Bắt đầu chỉ với 3 bước</h2>
                </div>

                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">01</div>
                        <div className="step-icon"><SearchIcon /></div>
                        <h3>Tìm kiếm điều dưỡng</h3>
                        <p>Lựa chọn điều dưỡng dựa trên kinh nghiệm, đánh giá và vị trí của bạn.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">02</div>
                        <div className="step-icon"><CalendarIcon /></div>
                        <h3>Đặt lịch & Thanh toán</h3>
                        <p>Chọn thời gian phù hợp và thanh toán an toàn qua nền tảng CareMate.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">03</div>
                        <div className="step-icon"><HeartPulseIcon /></div>
                        <h3>Tận hưởng dịch vụ</h3>
                        <p>Điều dưỡng sẽ đến tận nhà để chăm sóc bạn và bé một cách chu đáo nhất.</p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials">
                <div className="section-header">
                    <span className="section-label">Phản hồi khách hàng</span>
                    <h2 className="section-title">Các gia đình nói gì về CareMate?</h2>
                </div>

                <div className="testimonial-grid">
                    <div className="testimonial-card">
                        <div className="rating">
                            {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                        </div>
                        <p>"Dịch vụ rất chuyên nghiệp. Chị điều dưỡng chăm sóc bé rất mát tay, hướng dẫn mình cách tắm bé rất chi tiết."</p>
                        <div className="user-profile">
                            <div className="user-name">Chị Thu Thảo</div>
                            <div className="user-info">Quận 7, TP.HCM</div>
                        </div>
                    </div>
                    <div className="testimonial-card">
                        <div className="rating">
                            {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                        </div>
                        <p>"Mình rất an tâm khi đặt lịch qua CareMate. Quy trình minh bạch, điều dưỡng y đức và nhiệt tình."</p>
                        <div className="user-profile">
                            <div className="user-name">Chị Mai Phương</div>
                            <div className="user-info">Quận Tân Bình, TP.HCM</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="final-cta">
                <div className="cta-box">
                    <h2>Sẵn sàng bắt đầu hành trình của bạn?</h2>
                    <p>Đăng ký ngay hôm nay để nhận được sự chăm sóc tận tâm nhất từ CareMate.</p>
                    <div className="cta-buttons">
                        <Link to="/register" className="cta-btn primary inverse">Tạo tài khoản miễn phí</Link>
                        <Link to="/find-nurse" className="cta-btn secondary outline">Xem danh sách điều dưỡng</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
