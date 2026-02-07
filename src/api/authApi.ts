import axiosInstance from './axios';
import type { LoginDto, RegisterDto, RegisterNurseDto, TokenResponse, User, ExternalLoginDto } from '../types/auth';

export const authApi = {
    login: async (data: LoginDto): Promise<TokenResponse> => {
        const response = await axiosInstance.post<TokenResponse>('/api/Auth/login', data);
        return response.data;
    },

    externalLogin: async (data: ExternalLoginDto): Promise<TokenResponse> => {
        const response = await axiosInstance.post<TokenResponse>('/api/Auth/login/external', data);
        return response.data;
    },

    registerCustomer: async (data: RegisterDto): Promise<TokenResponse> => {
        const response = await axiosInstance.post<TokenResponse>('/api/Auth/signup/customer', data);
        return response.data;
    },

    registerNurse: async (data: RegisterNurseDto): Promise<TokenResponse> => {
        const response = await axiosInstance.post<TokenResponse>('/api/Auth/signup/nurse', data);
        return response.data;
    },

    refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
        const response = await axiosInstance.post<TokenResponse>('/api/Auth/refresh-token', {
            refreshToken,
        });
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await axiosInstance.get<User>('/api/Auth/me');
        return response.data;
    },
};

export default authApi;
