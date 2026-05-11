export type VerificationStatus = 'unverified' | 'verified' | 'rejected';
export type DocumentStatus = 'pending_review' | 'approved' | 'rejected';

export interface DocumentDto {
    id: number;
    type: string;
    fileUrl: string;
    status: DocumentStatus;
}

export interface NurseProfileDetailDto {
    userId: number;
    fullName: string;
    email: string;
    phone: string;
    bio: string;
    yearsExperience: number;
    serviceRadiusKm: number;
    isVerified: VerificationStatus;
    documents: DocumentDto[];
}

export interface UpdateNurseProfileDto {
    bio: string;
    yearsExperience: number;
    serviceRadiusKm: number;
}

export interface UploadDocumentDto {
    type: string;
    file: File;
}

export interface ReviewNurseProfileDto {
    isApproved: boolean;
    comment: string;
}
