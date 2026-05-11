import axiosInstance from './axios';
import type { AvailabilitySlot, CreateAvailabilityRequest } from '../types/availability';

export const availabilityApi = {
  getSlots: async (nurseId: number, date?: string) => {
    const params = date ? { date } : {};
    const response = await axiosInstance.get<AvailabilitySlot[]>(`/api/nurses/${nurseId}/availability`, { params });
    return response.data;
  },

  getMySlots: async () => {
    const response = await axiosInstance.get<AvailabilitySlot[]>('/api/availability/my-slots');
    return response.data;
  },

  create: async (data: CreateAvailabilityRequest) => {
    const response = await axiosInstance.post<AvailabilitySlot>('/api/availability/slots', data);
    return response.data;
  },

  delete: async (slotId: number) => {
    await axiosInstance.delete(`/api/availability/slots/${slotId}`);
  }
};

export default availabilityApi;
