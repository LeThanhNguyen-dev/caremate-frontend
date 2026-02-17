import axiosInstance from './axios';
import type { NurseProfileDetailDto, ReviewNurseProfileDto } from '../types/nurse';

export const adminApi = {
    getPendingNurses: async (): Promise<NurseProfileDetailDto[]> => {
        const response = await axiosInstance.get<NurseProfileDetailDto[]>('/api/Admin/nurses/pending');
        return response.data;
    },

    getNurseDetails: async (id: number): Promise<NurseProfileDetailDto> => {
        const response = await axiosInstance.get<NurseProfileDetailDto>(`/api/Admin/nurses/${id}/details`);
        return response.data;
    },

    reviewNurse: async (id: number, data: ReviewNurseProfileDto): Promise<void> => {
        await axiosInstance.post(`/api/Admin/nurses/${id}/review`, data);
    },
};

export default adminApi;
