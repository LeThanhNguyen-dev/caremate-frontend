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
    address?: string | null;
    ward?: string | null;
    district?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    defaultAddress?: {
        fullAddress: string;
        ward: string | null;
        district: string | null;
        latitude: number | null;
        longitude: number | null;
    } | null;
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
    address?: string;
    ward?: string;
    district?: string;
    latitude?: number | null;
    longitude?: number | null;
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
