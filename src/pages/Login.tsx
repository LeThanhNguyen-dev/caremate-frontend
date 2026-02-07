import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import './Login.css';



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
            await login({ email, password });
            navigate(from, { replace: true });
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
            await loginExternal({
                provider: provider,
                idToken: idToken,
            });



            navigate(from, { replace: true });
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
            <div className="auth-card">
                {/* Left Side - Introduction */}
                <div className="auth-intro">
                    <div className="intro-content">
                        <h2>Chào mừng trở lại!</h2>
                        <p>Đăng nhập để tiếp tục sử dụng dịch vụ chăm sóc sức khỏe chuyên nghiệp của CareMate</p>
                        <div className="intro-features">
                            <div className="intro-feature">
                                <div className="intro-feature-icon">✓</div>
                                <span>Kết nối với điều dưỡng chuyên nghiệp</span>
                            </div>
                            <div className="intro-feature">
                                <div className="intro-feature-icon">✓</div>
                                <span>Đặt lịch chăm sóc linh hoạt</span>
                            </div>
                            <div className="intro-feature">
                                <div className="intro-feature-icon">✓</div>
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

                    <div className="divider">
                        <span>Hoặc</span>
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
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                required
                                disabled={isLoading}
                            />
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
