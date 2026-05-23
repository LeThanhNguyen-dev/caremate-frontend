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
    avatar?: string | null;
    bankBin?: string | null;
    bankAccountNumber?: string | null;
    bankAccountName?: string | null;
    bio: string;
    specialization?: string | null;
    yearsExperience: number;
    serviceRadiusKm: number;
    isVerified: VerificationStatus;
    rejectionReason?: string | null;
    verificationSubmissionStatus?: 'draft' | 'submitted' | 'approved' | 'rejected';
    averageRating?: number;
    totalReviews?: number;
    ratingDistribution?: Record<number, number>;
    documents: DocumentDto[];
    reviews?: NurseReviewDto[];
}

export interface NurseReviewDto {
    id: number;
    bookingId: number;
    customerId: number;
    customerName: string;
    customerAvatar?: string | null;
    serviceId: number;
    serviceName: string;
    serviceCategory?: string | null;
    rating: number;
    comment?: string | null;
    createdAt: string;
}

export interface UpdateNurseProfileDto {
    fullName?: string;
    phoneNumber?: string;
    avatar?: string;
    bio: string;
    specialization?: string;
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
