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
    bankBin?: string | null;
    bankAccountNumber?: string | null;
    bankAccountName?: string | null;
    bio: string;
    yearsExperience: number;
    serviceRadiusKm: number;
    isVerified: VerificationStatus;
    rejectionReason?: string | null;
    verificationSubmissionStatus?: 'draft' | 'submitted' | 'approved' | 'rejected';
    documents: DocumentDto[];
}

export interface UpdateNurseProfileDto {
    bio: string;
    yearsExperience: number;
    serviceRadiusKm: number;
    bankBin?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
}

export interface UploadDocumentDto {
    type: string;
    file: File;
}

export interface UploadDocumentsDto {
    type: string;
    files: File[];
}

export interface ReviewNurseProfileDto {
    isApproved: boolean;
    comment: string;
}
