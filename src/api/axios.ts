import axios from 'axios';
import i18n from '../i18n/i18n';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach token + language
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['Accept-Language'] = i18n.language || 'vi';
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle 401 + token refresh + retry 5xx
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        // Retry up to 2 times on server errors (5xx) with exponential backoff
        if (status >= 500 && status < 600 && (!originalRequest._retryCount || originalRequest._retryCount < 2)) {
            originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
            const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount), 4000);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return axiosInstance(originalRequest);
        }

        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const currentRefreshToken = localStorage.getItem('refreshToken');
                const currentAccessToken = localStorage.getItem('accessToken');

                if (currentRefreshToken && currentAccessToken) {
                    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
                        accessToken: currentAccessToken,
                        refreshToken: currentRefreshToken,
                    });

                    const newAccessToken = response.data.accessToken;
                    const newRefreshToken = response.data.refreshToken;

                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
