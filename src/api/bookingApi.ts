import axiosInstance from './axios';
import type { BookingDetail, CreateBookingRequest } from '../types/booking';

export const bookingApi = {
  create: async (data: CreateBookingRequest) => {
    const response = await axiosInstance.post<BookingDetail>('/api/bookings', data);
    return response.data;
  },

  getHistory: async () => {
    const response = await axiosInstance.get<BookingDetail[]>('/api/bookings/my-history');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await axiosInstance.get<BookingDetail>(`/api/bookings/${id}`);
    return response.data;
  },

  cancel: async (id: number, reason?: string) => {
    const response = await axiosInstance.post(`/api/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    await axiosInstance.patch(`/api/bookings/${id}/status`, { status });
  }
};

export default bookingApi;
