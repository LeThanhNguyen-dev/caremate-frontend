import axiosInstance from './axios';
import type { CccdOcrResultDto, NurseProfileDetailDto, ReviewNurseProfileDto } from '../types/nurse';

export const adminApi = {
    getPendingNurses: async (): Promise<NurseProfileDetailDto[]> => {
        const response = await axiosInstance.get<NurseProfileDetailDto[]>('/api/admin/nurses/pending');
        return response.data;
    },

    getNurseDetails: async (id: number): Promise<NurseProfileDetailDto> => {
        const response = await axiosInstance.get<NurseProfileDetailDto>(`/api/admin/nurses/${id}/details`);
        return response.data;
    },

    reviewNurse: async (id: number, data: ReviewNurseProfileDto): Promise<void> => {
        await axiosInstance.post(`/api/admin/nurses/${id}/review`, data);
    },

    ocrNurseDocument: async (documentId: number): Promise<CccdOcrResultDto> => {
        const response = await axiosInstance.post<CccdOcrResultDto>(`/api/admin/nurses/documents/${documentId}/ocr`);
        return response.data;
    },
};

export default adminApi;
