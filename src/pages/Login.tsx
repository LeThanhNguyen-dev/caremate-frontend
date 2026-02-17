import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import './Login.css';

// SVG Icons as components
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

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, loginExternal } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await login({ email, password });

            // Role-based redirection
            if (from !== '/') {
                navigate(from, { replace: true });
            } else if (user.role === 'admin') {
                navigate('/admin/pending-nurses', { replace: true });
            } else if (user.role === 'nurse_unconfirmed') {
                navigate('/nurse/profile', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                setError(axiosError.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
            } else {
                setError('Đăng nhập thất bại. Vui lòng thử lại.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleExternalLogin = async (provider: 'google' | 'facebook', idToken: string) => {
        setError('');
        setIsLoading(true);
        try {
            const user = await loginExternal({
                provider: provider,
                idToken: idToken,
            });

            // Role-based redirection
            if (from !== '/') {
                navigate(from, { replace: true });
            } else if (user.role === 'admin') {
                navigate('/admin/pending-nurses', { replace: true });
            } else if (user.role === 'nurse_unconfirmed') {
                navigate('/nurse/profile', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                setError(axiosError.response?.data?.message || 'Đăng nhập Google/Facebook thất bại.');
            } else {
                setError('Đăng nhập Google/Facebook thất bại.');
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
                        <h1>Chào mừng trở lại!</h1>
                        <p>
                            Đăng nhập để tiếp tục sử dụng dịch vụ chăm sóc sức khỏe
                            chuyên nghiệp của CareMate.
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
                                <span>Kết nối với điều dưỡng chuyên nghiệp</span>
                            </div>
                            <div className="intro-feature">
                                <div className="intro-feature-icon">
                                    <CheckIcon />
                                </div>
                                <span>Đặt lịch chăm sóc linh hoạt</span>
                            </div>
                            <div className="intro-feature">
                                <div className="intro-feature-icon">
                                    <CheckIcon />
                                </div>
                                <span>Hỗ trợ 24/7</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-container">
                    <div className="auth-header">
                        <h1>Đăng nhập</h1>
                        <p>Truy cập vào tài khoản của bạn</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><EmailIcon /></span>
                                <input
                                    type="email"
                                    id="email"
                                    className="has-icon"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><LockIcon /></span>
                                <input
                                    type="password"
                                    id="password"
                                    className="has-icon"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button type="submit" className="auth-btn" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Đang đăng nhập...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>

                    <div className="divider">
                        <span>Hoặc tiếp tục với</span>
                    </div>

                    <div className="social-login">
                        <GoogleLogin
                            onSuccess={(cred) => {
                                const idToken = cred.credential;
                                if (!idToken) {
                                    setError('Không lấy được Google credential.');
                                    return;
                                }
                                handleExternalLogin('google', idToken);
                            }}
                            onError={() => setError('Đăng nhập Google thất bại.')}
                            useOneTap={false}
                            shape="pill"
                        />

                        <FacebookLogin
                            appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                            onSuccess={(res: any) => {
                                const token = res?.accessToken;
                                if (!token) {
                                    setError('Không lấy được Facebook access token.');
                                    return;
                                }
                                handleExternalLogin('facebook', token);
                            }}
                            onFail={() => setError('Đăng nhập Facebook thất bại.')}
                            render={({ onClick }: any) => (
                                <button type="button" className="social-btn facebook" onClick={onClick} disabled={isLoading}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    Facebook
                                </button>
                            )}
                        />
                    </div>

                    <div className="auth-footer">
                        <p>
                            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
