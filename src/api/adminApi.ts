import axiosInstance from './axios';
import type { CccdOcrResultDto, NurseDocumentOcrLogDto, NurseProfileDetailDto, ReviewNurseDocumentDto, ReviewNurseProfileDto } from '../types/nurse';

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

    getOcrLogs: async (nurseUserId: number): Promise<NurseDocumentOcrLogDto[]> => {
        const response = await axiosInstance.get<NurseDocumentOcrLogDto[]>(`/api/admin/ocr/logs/${nurseUserId}`);
        return response.data;
    },

    approveNurseDocument: async (nurseUserId: number, documentId: number, data: ReviewNurseDocumentDto = {}): Promise<void> => {
        await axiosInstance.put(`/api/admin/nurses/${nurseUserId}/documents/${documentId}/approve`, data);
    },

    rejectNurseDocument: async (nurseUserId: number, documentId: number, data: ReviewNurseDocumentDto): Promise<void> => {
        await axiosInstance.put(`/api/admin/nurses/${nurseUserId}/documents/${documentId}/reject`, data);
    },

    deleteNurseDocument: async (nurseUserId: number, documentId: number): Promise<void> => {
        await axiosInstance.delete(`/api/admin/nurses/${nurseUserId}/documents/${documentId}`);
    },
};

export default adminApi;
