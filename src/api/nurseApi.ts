import axiosInstance from './axios';
import type { NurseProfileDetailDto, UpdateNurseProfileDto, UploadDocumentDto } from '../types/nurse';

export const nurseApi = {
    getProfile: async (): Promise<NurseProfileDetailDto> => {
        const response = await axiosInstance.get<NurseProfileDetailDto>('/api/nurse/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateNurseProfileDto): Promise<void> => {
        await axiosInstance.put('/api/nurse/profile', data);
    },

    uploadDocument: async (data: UploadDocumentDto): Promise<void> => {
        await axiosInstance.post('/api/nurse/documents', data);
    },
};

export default nurseApi;
