import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

// SVG Icons as components
const PersonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const EmailIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const PhoneIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const BriefcaseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
        bio: '',
        yearsExperience: 0,
        serviceRadiusKm: 5,
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'yearsExperience' || name === 'serviceRadiusKm') {
            setFormData((prev) => ({ ...prev, [name]: Number(value) }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setIsLoading(true);

        try {
            let user;
            if (formData.role === 'nurse') {
                user = await register(
                    {
                        fullName: formData.fullName,
                        email: formData.email,
                        phone: formData.phone || undefined,
                        password: formData.password,
                        bio: formData.bio || undefined,
                        yearsExperience: Number(formData.yearsExperience),
                        serviceRadiusKm: Number(formData.serviceRadiusKm),
                    },
                    'nurse'
                );
            } else {
                user = await register(
                    {
                        fullName: formData.fullName,
                        email: formData.email,
                        phone: formData.phone || undefined,
                        password: formData.password,
                        role: formData.role as 'customer',
                    },
                    'customer'
                );
            }

            // Role-based redirection after success
            if (user.role === 'nurse_unconfirmed') {
                navigate('/nurse/profile', { replace: true });
            } else if (user.role === 'admin') {
                navigate('/admin/pending-nurses', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                setError(axiosError.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            } else {
                setError('Đăng ký thất bại. Vui lòng thử lại.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Main Content */}
            <div className="auth-main">
                {/* Left Side - Introduction */}
                <div className="auth-intro">
                    <div className="intro-content">
                        <h1>Tạo tài khoản</h1>
                        <p>
                            Tham gia cộng đồng phụ huynh và điều dưỡng chuyên nghiệp.
                            Bắt đầu hành trình chăm sóc sức khỏe của bạn.
                        </p>

                        {/* Illustration */}
                        <div className="intro-illustration">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfbkZThp-UG2BFZ1Xz1a1hOp70YCyogT3-N9_HF1AGkL_WQn5HDpW33KyVeFKO8NmtfKf9gaTmuw2bAIKYgxNfQOpezi6NIygfrUx_Pg4GCSOPm_oB3N0hZQ8ylo0Z-r4o1Ttrf_eu7CNvj3SDgMBqEFpEZgFQ5YT9F9ZZYJeiYfkNduHnUsbmKUmaR3Jm7pbdkA9-oXiqksjpXRXPRdiO3cIiDokWyrJVGx8H8zwaHQzSoDAO6UmPnBLsry7mYFCoGWvMl3AZ9_I"
                                alt="Nurse holding a baby"
                                className="nurse-illustration"
                            />
                        </div>

                        {/* Feature highlights */}
                        <div className="intro-features">
                            <div className="intro-feature">
                                <div className="intro-feature-icon">
                                    <CheckIcon />
                                </div>
                                <span>Xác minh lý lịch chuyên nghiệp</span>
                            </div>
                            <div className="intro-feature">
                                <div className="intro-feature-icon">
                                    <CheckIcon />
                                </div>
                                <span>Hỗ trợ 24/7 cho thành viên</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-container">
                    {/* Role Tabs */}
                    <div className="role-selector">
                        <button
                            type="button"
                            className={`role-tab ${formData.role === 'customer' ? 'active' : ''}`}
                            onClick={() => setFormData((prev) => ({ ...prev, role: 'customer' }))}
                            disabled={isLoading}
                        >
                            Đăng ký Khách hàng
                        </button>
                        <button
                            type="button"
                            className={`role-tab ${formData.role === 'nurse' ? 'active' : ''}`}
                            onClick={() => setFormData((prev) => ({ ...prev, role: 'nurse' }))}
                            disabled={isLoading}
                        >
                            Đăng ký Điều dưỡng
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        {/* Full Name */}
                        <div className="form-group">
                            <label htmlFor="fullName">Họ và tên</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><PersonIcon /></span>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    className="has-icon"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="VD: Nguyễn Văn A"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><EmailIcon /></span>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="has-icon"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><LockIcon /></span>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="has-icon"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Tối thiểu 6 ký tự"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><PhoneIcon /></span>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="has-icon"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder={formData.role === 'nurse' ? "Số giấy phép hoặc chứng chỉ" : "VD: 0123 456 789"}
                                    disabled={isLoading}
                                    required={formData.role === 'nurse'}
                                />
                            </div>
                        </div>

                        {/* Nurse-specific fields */}
                        {formData.role === 'nurse' && (
                            <>

                                <div className="form-group">
                                    <label htmlFor="yearsExperience">Số năm kinh nghiệm</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon"><BriefcaseIcon /></span>
                                        <select
                                            id="yearsExperience"
                                            name="yearsExperience"
                                            className="has-icon"
                                            value={formData.yearsExperience}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        >
                                            <option value={0}>Chọn kinh nghiệm...</option>
                                            <option value={1}>Dưới 1 năm</option>
                                            <option value={2}>1-2 năm</option>
                                            <option value={3}>3-5 năm</option>
                                            <option value={5}>5-10 năm</option>
                                            <option value={10}>Trên 10 năm</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><LockIcon /></span>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className="has-icon"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button type="submit" className="auth-btn" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Đang tạo tài khoản...
                                </>
                            ) : (
                                'Tạo tài khoản'
                            )}
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="auth-footer">
                        <p>
                            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
