import axiosInstance from './axios';
import type { NurseProfileDetailDto, UpdateNurseProfileDto, UploadDocumentDto, UploadDocumentsDto } from '../types/nurse';

type NurseSearchParams = Record<string, string | number | boolean | undefined>;

export const nurseApi = {
    getProfile: async (): Promise<NurseProfileDetailDto> => {
        const response = await axiosInstance.get<NurseProfileDetailDto>('/api/nurse/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateNurseProfileDto): Promise<void> => {
        await axiosInstance.put('/api/nurse/profile', data);
    },

    uploadDocument: async (data: UploadDocumentDto): Promise<void> => {
        const formData = new FormData();
        formData.append('Type', data.type); 
        formData.append('File', data.file);
        
        await axiosInstance.post('/api/nurse/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    uploadDocuments: async (data: UploadDocumentsDto): Promise<void> => {
        const formData = new FormData();
        formData.append('Type', data.type);
        data.files.forEach((file) => formData.append('Files', file));

        await axiosInstance.post('/api/nurse/documents/batch', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    submitVerification: async (): Promise<void> => {
        await axiosInstance.post('/api/nurse/verification/submit');
    },

    getNurses: async (params?: NurseSearchParams) => {
        const response = await axiosInstance.get('/api/nurses', { params });
        return response.data;
    },

    getById: async (id: number): Promise<NurseProfileDetailDto> => {
        const response = await axiosInstance.get<NurseProfileDetailDto>(`/api/nurses/${id}`);
        return response.data;
    }
};

export default nurseApi;
