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
  serviceKind?: 'single' | 'package' | string;
  nurseName?: string;
  status: string;
  totalPrice: number;
  platformFee: number;
  nursePayoutAmount: number;
  startTime: string;
  endTime: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  actualDurationMinutes?: number | null;
  address: string;
  notes: string | null;
  nurseNote?: string | null;
  customerSessionRating?: number | null;
  customerSessionNote?: string | null;
  customerSessionTags?: string[];
  customerSessionReviewedAt?: string | null;
  finalReviewId?: number | null;
  finalReviewRating?: number | null;
  finalReviewComment?: string | null;
  finalReviewCreatedAt?: string | null;
  paymentStatus?: string | null;
  refundAmount?: number | null;
  refundReason?: string | null;
  refundStatus?: string | null;
  refundedAt?: string | null;
  packageDays?: number | null;
  completedSessions?: number;
};

export type BookingStatusHistoryDto = {
  id: number;
  bookingId: number;
  status: string;
  changedBy: number | null;
  changedByName: string | null;
  note: string | null;
  createdAt: string;
};

export type AvailabilitySlotDto = {
  id: number;
  nurseProfileId: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
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
  bio: string | null;
  specialization?: string | null;
  yearsExperience: number;
  serviceRadiusKm: number;
  isVerified: string;
  rejectionReason?: string | null;
  verificationSubmissionStatus?: string;
  averageRating?: number;
  totalReviews?: number;
  ratingDistribution?: Record<number, number>;
  documents: NurseDocumentDto[];
  reviews?: ReviewDto[];
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
  distanceKm?: number | null;
  distanceSource?: string | null;
  matchScore?: number;
  matchReasons?: string[];
  aiMatchSummary?: string | null;
  aiSummaryFallback?: boolean;
  completedBookings?: number;
  totalReviews?: number;
  nextAvailableAt?: string | null;
  district?: string | null;
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
  serviceKind: 'single' | 'package' | string;
  packageDays: number | null;
  includedServiceKeys: string | null;
  packageSchedule: PackageScheduleEntryDto[];
  status: string;
};

export type PackageScheduleEntryDto = {
  day: number;
  title: string | null;
  description: string | null;
  serviceKeys: string | null;
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
  serviceCategory?: string | null;
  rating: number;
  comment: string | null;
  createdAt: string | null;
};

export type CommunityCommentDto = {
  id: number;
  authorId: number;
  parentCommentId: number | null;
  author: string;
  avatar: string | null;
  content: string;
  likes: number;
  likedByMe: boolean;
  createdAt: string;
  replies: CommunityCommentDto[];
};

export type CommunityCommentLikerDto = {
  userId: number;
  fullName: string;
  avatar: string | null;
};

export type CommunityPostDto = {
  id: number;
  authorId: number;
  author: string;
  role: string;
  avatar: string | null;
  title: string;
  content: string;
  tags: string[];
  imageUrl: string | null;
  likes: number;
  likedByMe: boolean;
  createdAt: string;
  comments: CommunityCommentDto[];
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

export type AdminRefundDto = {
  bookingId: number;
  bookingStatus: string;
  customerId: number;
  customerName: string;
  nurseId: number;
  nurseName: string;
  serviceName: string;
  totalPrice: number;
  refundAmount: number;
  hasPayment: boolean;
  refundReason: string | null;
  refundStatus: string | null;
  customerBankBin: string | null;
  customerBankAccountNumber: string | null;
  customerBankAccountName: string | null;
  customerQrUrl: string | null;
};

export type AdminPayoutDto = {
  payoutId: number;
  bookingId: number;
  nurseId: number;
  nurseName: string;
  serviceName: string;
  grossAmount: number;
  amount: number;
  platformFee: number;
  status: string;
  nurseBankBin: string | null;
  nurseBankAccountNumber: string | null;
  nurseBankAccountName: string | null;
  nurseQrUrl: string | null;
};

export type PayOsWebhookLogDto = {
  id: string;
  orderCode: string | null;
  eventCode: string | null;
  eventDescription: string | null;
  isVerified: boolean;
  isProcessed: boolean;
  processingError: string | null;
  retryCount: number;
  receivedAt: string;
  processedAt: string | null;
};

export type TransactionHistoryItemDto = {
  id: string;
  type: 'payment' | 'refund' | 'payout' | string;
  bookingId: number;
  userId: number | null;
  userName: string | null;
  serviceName: string | null;
  amount: number;
  status: string;
  method: string | null;
  transactionId: string | null;
  createdAt: string;
};

export type FinanceDailyMetricDto = {
  date: string;
  revenue: number;
  refunds: number;
  payouts: number;
  bookingCount: number;
};

export type NursePerformanceMetricDto = {
  nurseId: number;
  nurseName: string;
  completedBookingCount: number;
  revenue: number;
  payoutAmount: number;
};

export type AdminFinanceAnalyticsDto = {
  grossRevenue: number;
  refundAmount: number;
  payoutAmount: number;
  platformFeeAmount: number;
  paidPaymentCount: number;
  refundCount: number;
  pendingPayoutCount: number;
  failedWebhookCount: number;
  refundRatePercent: number;
  bookingCompletionRatePercent: number;
  dailyMetrics: FinanceDailyMetricDto[];
  nursePerformance: NursePerformanceMetricDto[];
};

export type AuditLogDto = {
  id: string;
  actorUserId: number | null;
  actorName: string | null;
  method: string;
  path: string;
  queryString: string | null;
  statusCode: number;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type AdminOcrSettingsDto = {
  provider: string;
  purpose: string;
  idCardEndpoint: string;
  isConfigured: boolean;
  maskedApiKey: string | null;
};

export type BankOptionDto = {
  code: string;
  name: string;
  shortName?: string | null;
  bin?: string | null;
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
  platformFee: number;
  nursePayoutAmount: number;
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
  bookingId: number | null;
  user1Id: number;
  user2Id: number;
  type: 'booking' | 'support' | string;
  peerName?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  canSend: boolean;
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

export type PayOSPaymentLink = {
  bookingId: number;
  orderCode: number;
  checkoutUrl: string;
  paymentLinkId: string | null;
};

export type SuggestedServiceDto = {
  serviceKey: string;
  serviceName: string;
  reason: string;
};

export type CarePlanItemDto = {
  timeframe: string;
  action: string;
  reason: string;
};

export type RiskFactorDto = {
  code: string;
  label: string;
  points: number;
  category: string;
};

export type NutritionTipDto = {
  category: string;
  tip: string;
  reason: string;
  icon: string;
};

export type TrendSignalDto = {
  metric: string;
  direction: 'up' | 'down' | 'stable' | string;
  summary: string;
};

export type HealthAnalysisResponse = {
  checkInId: string;
  analysisId: string;
  summary: string;
  warningLevel: 'Green' | 'Yellow' | 'Red' | 'Emergency' | 'Low' | 'Medium' | 'High' | string;
  urgencyAction: string;
  weeklySummary: string;
  riskScore: number;
  confidenceScore: number;
  confidenceLabel: string;
  trendSummary: string;
  riskFactors: RiskFactorDto[];
  trendSignals: TrendSignalDto[];
  recommendations: string[];
  carePlan: CarePlanItemDto[];
  suggestedServices: SuggestedServiceDto[];
  disclaimer: string;
  engineVersion: string;
  ppdScreeningScore: number;
  ppdScreeningLevel: 'Low' | 'Moderate' | 'High' | string;
  ppdScreeningNote: string;
  nutritionGuidance: NutritionTipDto[];
  narrativeSummary: string;
  dataCoveragePercent: number;
  dataCoverageItems: string[];
  missingDataItems: string[];
  followUpQuestions: FollowUpQuestionDto[];
};

export type FollowUpQuestionDto = {
  key: string;
  questionVi: string;
  inputType: string;
  unit: string | null;
};

export type AnalyzeHealthCheckInPayload = {
  sleepHours: number;
  painLevel?: number | null;
  painLocation?: string | null;
  painType?: string | null;
  painDuration?: string | null;
  painTrend?: string | null;
  symptoms?: string[];
  medicalHistory?: string[];
  contextData?: Record<string, string>;
  motherAge?: number | null;
  systolicBloodPressure?: number | null;
  diastolicBloodPressure?: number | null;
  temperatureCelsius?: number | null;
  tookMedicationToday?: boolean;
  medicationNote?: string | null;
  mood: string;
  milkStatus: string;
  babyFeeding: string;
  babySleep: string;
  note?: string | null;
};

export type HealthCheckInRiskPreviewDto = {
  warningLevel: string;
  riskScore: number;
  confidenceScore: number;
  summary: string;
  urgencyAction: string;
  riskFactors: RiskFactorDto[];
};

export type HealthCheckInFollowUpPreviewResponse = {
  dataCoveragePercent: number;
  dataCoverageItems: string[];
  missingDataItems: string[];
  followUpQuestions: FollowUpQuestionDto[];
  estimatedRiskPreview: HealthCheckInRiskPreviewDto;
  engineVersion: string;
};

export type GeoPointDto = {
  lat: number;
  lng: number;
};

export type RecommendedCareServiceDto = {
  serviceId: number;
  name: string;
  reason: string;
  sessionCount: number | null;
  estimatedPrice: number;
};

export type CarePlanTimelineItemDto = {
  sessionNumber: number;
  scheduledDate: string;
  focus: string;
  activities: string[];
  notes: string;
  durationMinutes: number;
};

export type CarePlanResponse = {
  carePlanId: string;
  planType: 'by_booking' | 'recommend_package' | string;
  status: string;
  safetyLevel: 'normal' | 'watch' | 'urgent' | string;
  safetyNotice: string | null;
  summary: string;
  recommendedServices: RecommendedCareServiceDto[];
  planItems: CarePlanTimelineItemDto[];
  recommendedNurses: NurseDiscoveryDto[];
  disclaimer: string;
  aiModel: string | null;
  fallbackMode: boolean;
  createdAt: string;
};

export type CarePlanRecommendRequest = {
  healthCheckInId?: string | null;
  checkIn?: AnalyzeHealthCheckInPayload | null;
  userLocation?: GeoPointDto | null;
};

export type AiChatConversationDto = {
  id: string;
  title: string | null;
  status: string;
  messageCount: number;
  createdAt: string;
  lastMessageAt: string | null;
};

export type AiChatCreateResponse = {
  conversationId: string;
  createdAt: string;
};

export type AiChatMessageDto = {
  messageId: string;
  conversationId: string;
  role: 'user' | 'assistant' | string;
  content: string;
  safetyFlag: boolean;
  safetyTriggeredBy: string | null;
  ctaAction: string | null;
  disclaimer: string;
  fallbackMode: boolean;
  createdAt: string;
};

export type HealthCheckInHistoryDto = {
  checkInId: string;
  createdAt: string;
  sleepHours: number;
  painLevel: number | null;
  painLocation: string | null;
  painType: string | null;
  painDuration: string | null;
  painTrend: string | null;
  symptoms: string[];
  medicalHistory: string[];
  contextData: Record<string, string>;
  motherAge: number | null;
  systolicBloodPressure: number | null;
  diastolicBloodPressure: number | null;
  temperatureCelsius: number | null;
  tookMedicationToday: boolean;
  medicationNote: string | null;
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
  painLevel: number | null;
  painLocation: string | null;
  painType: string | null;
  painDuration: string | null;
  painTrend: string | null;
  symptoms: string[];
  medicalHistory: string[];
  contextData: Record<string, string>;
  motherAge: number | null;
  systolicBloodPressure: number | null;
  diastolicBloodPressure: number | null;
  temperatureCelsius: number | null;
  tookMedicationToday: boolean;
  medicationNote: string | null;
  mood: string;
  milkStatus: string;
  babyFeeding: string;
  babySleep: string;
  note: string | null;
  analysis: HealthAnalysisResponse | null;
};
export type PackageSessionDto = {
  id: number;
  sessionNumber: number;
  sessionDate: string;
  title: string | null;
  description: string | null;
  plannedServiceKeys: string | null;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  nurseNote: string | null;
  customerRating: number | null;
  customerNote: string | null;
  customerTags: string[];
  customerReviewedAt: string | null;
};

export type PackageProgressDto = {
  bookingId: number;
  totalSessions: number;
  completedSessions: number;
  progressPercent: number;
  reviewedSessions: number;
  averageCustomerRating: number | null;
  todaySession: PackageSessionDto | null;
  sessions: PackageSessionDto[];
};
