export type MessageResponse = { message: string };
export type NoContent = null;

export type TokenResponseDto = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  role: string;
  refreshToken: string;
};

export type MeResponse = {
  userId: string | null;
  fullName: string | null;
  email: string | null;
  role: string | null;
};

export type BookingDetailDto = {
  id: number;
  customerId: number;
  nurseId: number;
  serviceId: number;
  serviceName: string;
  nurseName?: string;
  status: string;
  totalPrice: number;
  startTime: string;
  endTime: string;
  address: string;
  notes: string | null;
};

export type AvailabilitySlotDto = {
  id: number;
  nurseProfileId: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

export type NurseDocumentDto = {
  id: number;
  type: string;
  fileUrl: string;
  status: string;
};

export type NurseProfileDetailDto = {
  userId: number;
  fullName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  yearsExperience: number;
  serviceRadiusKm: number;
  isVerified: string;
  rejectionReason?: string | null;
  documents: NurseDocumentDto[];
};

export type NurseDiscoveryDto = {
  userId: number;
  nurseProfileId: number;
  fullName: string;
  avatar: string | null;
  bio: string | null;
  specialization: string | null;
  averageRating: number;
  yearsExperience: number;
  serviceRadiusKm: number;
  servicePrice: number | null;
  serviceUnit: string | null;
};

export type NurseServiceDto = {
  id: number;
  nurseProfileId: number;
  serviceId: number;
  serviceName: string;
  price: number;
  unit: string;
  status: string;
  createdAt: string;
};

export type ServiceDetailDto = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  basePrice: number;
  estimatedDurationMinutes: number;
  status: string;
};

export type ReviewDto = {
  id: number;
  bookingId: number | null;
  nurseId: number | null;
  customerId: number | null;
  serviceId: number | null;
  nurseName: string | null;
  customerName: string | null;
  serviceName: string | null;
  rating: number;
  comment: string | null;
  createdAt: string | null;
};

export type AdminUserDto = {
  userId: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string | null;
  averageRating: number | null;
  yearsExperience: number | null;
  isVerified: string | null;
  bookingCount: number | null;
  bio: string | null;
};

export type AdminDashboardDto = {
  totalUsers: number;
  totalNurses: number;
  pendingNurseApprovals: number;
  openDisputes: number;
  pendingBookings: number;
};

export type AdminBookingSummaryDto = {
  id: number;
  customerId: number;
  nurseId: number;
  status: string;
  totalPrice: number;
  startTime: string;
  endTime: string;
};

export type Dispute = {
  id: number;
  bookingId: number;
  reason: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
};

export type Notification = {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export type Conversation = {
  id: number;
  bookingId: number;
  user1Id: number;
  user2Id: number;
  createdAt: string;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export type Payment = {
  id: number;
  bookingId: number;
  amount: number;
  method: string;
  status: string;
  transactionId: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  refundStatus: string | null;
  createdAt: string;
  refundedAt: string | null;
};

export type SuggestedServiceDto = {
  serviceKey: string;
  serviceName: string;
  reason: string;
};

export type HealthAnalysisResponse = {
  checkInId: string;
  analysisId: string;
  summary: string;
  warningLevel: 'Low' | 'Medium' | 'High' | string;
  recommendations: string[];
  suggestedServices: SuggestedServiceDto[];
  disclaimer: string;
};

export type HealthCheckInHistoryDto = {
  checkInId: string;
  createdAt: string;
  sleepHours: number;
  painLevel: number;
  mood: string;
  milkStatus: string;
  babyFeeding: string;
  babySleep: string;
  note: string | null;
  analysis: HealthAnalysisResponse | null;
};

export type LatestHealthCheckInDto = {
  checkInId: string;
  createdAt: string;
  sleepHours: number;
  painLevel: number;
  mood: string;
  milkStatus: string;
  babyFeeding: string;
  babySleep: string;
  note: string | null;
  analysis: HealthAnalysisResponse | null;
};
