import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

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
            if (formData.role === 'nurse') {
                await register(
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
                await register(
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

            navigate('/');
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
            <div className="auth-card register-card">
                {/* Left Side - Introduction */}
                <div className="auth-intro">
                    <div className="intro-content">
                        <h2>Tham gia cùng CareMate</h2>
                        <p>Tạo tài khoản để trải nghiệm dịch vụ chăm sóc sức khỏe chuyên nghiệp và tiện lợi</p>
                        <div className="intro-features">
                            <div className="intro-feature">
                                <div className="intro-feature-icon">✓</div>
                                <span>Xác thực chuyên nghiệp</span>
                            </div>
                            <div className="intro-feature">
                                <div className="intro-feature-icon">✓</div>
                                <span>Hỗ trợ 24/7</span>
                            </div>
                            <div className="intro-feature">
                                <div className="intro-feature-icon">✓</div>
                                <span>Dữ liệu được bảo mật</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-container">
                    <div className="auth-header">
                        <h1>Đăng ký</h1>
                        <p>Tạo tài khoản mới</p>
                    </div>

                    <div className="role-selector">
                        <button
                            type="button"
                            className={`role-tab ${formData.role === 'customer' ? 'active' : ''}`}
                            onClick={() => setFormData((prev) => ({ ...prev, role: 'customer' }))}
                            disabled={isLoading}
                        >
                            Khách hàng
                        </button>
                        <button
                            type="button"
                            className={`role-tab ${formData.role === 'nurse' ? 'active' : ''}`}
                            onClick={() => setFormData((prev) => ({ ...prev, role: 'nurse' }))}
                            disabled={isLoading}
                        >
                            Điều dưỡng
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="fullName">Họ và tên *</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nguyễn Văn A"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0123456789"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Mật khẩu *</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Ít nhất 6 ký tự"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {formData.role === 'nurse' && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="bio">Giới thiệu bản thân</label>
                                    <input
                                        type="text"
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Kinh nghiệm, chuyên môn..."
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="yearsExperience">Số năm kinh nghiệm</label>
                                        <input
                                            type="number"
                                            id="yearsExperience"
                                            name="yearsExperience"
                                            value={formData.yearsExperience}
                                            onChange={handleChange}
                                            min={0}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="serviceRadiusKm">Phạm vi phục vụ (km)</label>
                                        <input
                                            type="number"
                                            id="serviceRadiusKm"
                                            name="serviceRadiusKm"
                                            value={formData.serviceRadiusKm}
                                            onChange={handleChange}
                                            min={1}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button type="submit" className="auth-btn" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Đang đăng ký...
                                </>
                            ) : (
                                'Đăng ký'
                            )}
                        </button>
                    </form>

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
