import axiosInstance from './axios';
import type {
  AdminBookingSummaryDto,
  AdminDashboardDto,
  AdminOcrSettingsDto,
  AdminUserDto,
  AdminRefundDto,
  AdminPayoutDto,
  AvailabilitySlotDto,
  BookingDetailDto,
  BookingStatusHistoryDto,
  ChatMessage,
  CommunityCommentDto,
  CommunityCommentLikerDto,
  CommunityPostDto,
  Conversation,
  Dispute,
  HealthAnalysisResponse,
  HealthCheckInHistoryDto,
  LatestHealthCheckInDto,
  MeResponse,
  MessageResponse,
  NurseDiscoveryDto,
  NurseProfileDetailDto,
  NurseServiceDto,
  Notification,
  Payment,
  ReviewDto,
  ServiceDetailDto,
  PackageSessionDto,
  PackageProgressDto,
  PayOSPaymentLink,
  PayOsWebhookLogDto,
  TransactionHistoryItemDto,
  AuditLogDto,
  AdminFinanceAnalyticsDto,
  AnalyzeHealthCheckInPayload,
  HealthCheckInFollowUpPreviewResponse,
  CarePlanRecommendRequest,
  CarePlanResponse,
  AiChatConversationDto,
  AiChatCreateResponse,
  AiChatMessageDto
} from './frontend-api-contract';

type ApiRecord = Record<string, unknown>;

const asRecord = (value: unknown): ApiRecord => (value && typeof value === 'object' ? value as ApiRecord : {});

const getNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const getString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const toArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  const nested = record.items ?? record.data ?? record.results ?? record.users ?? record.reviews;
  return Array.isArray(nested) ? nested : [];
};

const requestFirst = async <T>(requests: Array<() => Promise<T>>): Promise<T> => {
  let lastError: unknown;
  for (const request of requests) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

const normalizeReview = (item: unknown): ReviewDto => {
  const record = asRecord(item);
  return {
    id: getNumber(record.id) ?? getNumber(record.reviewId) ?? 0,
    bookingId: getNumber(record.bookingId),
    nurseId: getNumber(record.nurseId) ?? getNumber(record.nurseUserId),
    customerId: getNumber(record.customerId),
    serviceId: getNumber(record.serviceId),
    nurseName: getString(record.nurseName) ?? getString(record.nurseFullName),
    customerName: getString(record.customerName) ?? getString(record.customerFullName) ?? getString(record.fullName),
    serviceName: getString(record.serviceName),
    serviceCategory: getString(record.serviceCategory) ?? getString(record.category),
    rating: getNumber(record.rating) ?? 0,
    comment: getString(record.comment),
    createdAt: getString(record.createdAt) ?? getString(record.reviewDate),
  };
};

const normalizeAdminUser = (item: unknown): AdminUserDto => {
  const record = asRecord(item);
  return {
    userId: getNumber(record.userId) ?? getNumber(record.id) ?? 0,
    fullName: getString(record.fullName) ?? getString(record.username) ?? `User #${getNumber(record.userId) ?? getNumber(record.id) ?? 0}`,
    email: getString(record.email),
    phone: getString(record.phone),
    role: getString(record.role) ?? 'customer',
    status: getString(record.status),
    averageRating: getNumber(record.averageRating),
    yearsExperience: getNumber(record.yearsExperience),
    isVerified: getString(record.isVerified),
    bookingCount: getNumber(record.bookingCount),
    bio: getString(record.bio),
  };
};

export const caremateApi = {
  getMe: async (): Promise<MeResponse> => (await axiosInstance.get('/api/auth/me')).data,

  getPendingNurses: async (): Promise<NurseProfileDetailDto[]> => (await axiosInstance.get('/api/admin/nurses/pending')).data,
  getNurseDetailsByAdmin: async (id: number): Promise<NurseProfileDetailDto> => (await axiosInstance.get(`/api/admin/nurses/${id}/details`)).data,
  reviewNurse: async (id: number, payload: { isApproved: boolean; comment: string }): Promise<MessageResponse> =>
    (await axiosInstance.post(`/api/admin/nurses/${id}/review`, payload)).data,
  getAdminDashboard: async (): Promise<AdminDashboardDto> => (await axiosInstance.get('/api/admin/dashboard')).data,
  getAdminBookings: async (): Promise<AdminBookingSummaryDto[]> => (await axiosInstance.get('/api/admin/bookings')).data,
  getAdminDisputes: async (): Promise<Dispute[]> => (await axiosInstance.get('/api/admin/disputes')).data,
  getAdminRefunds: async (refundStatus?: string): Promise<AdminRefundDto[]> =>
    (await axiosInstance.get('/api/admin/refunds', { params: { refundStatus } })).data,
  completeAdminRefund: async (bookingId: number, payload?: { adminNote?: string }): Promise<MessageResponse> =>
    (await axiosInstance.post(`/api/admin/refunds/${bookingId}/complete`, payload ?? {})).data,
  getAdminPayouts: async (payoutStatus?: string): Promise<AdminPayoutDto[]> =>
    (await axiosInstance.get('/api/admin/payouts', { params: { payoutStatus } })).data,
  completeAdminPayout: async (payoutId: number, payload?: { adminNote?: string }): Promise<MessageResponse> =>
    (await axiosInstance.post(`/api/admin/payouts/${payoutId}/complete`, payload ?? {})).data,
  getAdminTransactions: async (params?: { type?: string; status?: string; userId?: number; bookingId?: number; from?: string; to?: string }): Promise<TransactionHistoryItemDto[]> =>
    (await axiosInstance.get('/api/admin/transactions', { params })).data,
  getAdminFinanceAnalytics: async (params?: { from?: string; to?: string }): Promise<AdminFinanceAnalyticsDto> =>
    (await axiosInstance.get('/api/admin/finance/analytics', { params })).data,
  getPayOsWebhookLogs: async (status?: string): Promise<PayOsWebhookLogDto[]> =>
    (await axiosInstance.get('/api/admin/payments/webhook-logs', { params: { status } })).data,
  retryPayOsWebhookLog: async (logId: string): Promise<MessageResponse> =>
    (await axiosInstance.post(`/api/admin/payments/webhook-logs/${logId}/retry`)).data,
  getAdminAuditLogs: async (params?: { actorUserId?: number; path?: string; from?: string; to?: string }): Promise<AuditLogDto[]> =>
    (await axiosInstance.get('/api/admin/audit-logs', { params })).data,
  getAdminOcrSettings: async (): Promise<AdminOcrSettingsDto> =>
    (await axiosInstance.get('/api/admin/settings/ocr')).data,

  createBooking: async (payload: Record<string, unknown>): Promise<BookingDetailDto> => (await axiosInstance.post('/api/bookings', payload)).data,
  getMyCustomerBookings: async (): Promise<BookingDetailDto[]> => (await axiosInstance.get('/api/bookings/my/customer')).data,
  getMyNurseBookings: async (): Promise<BookingDetailDto[]> => (await axiosInstance.get('/api/bookings/my/nurse')).data,
  getBookingById: async (id: number): Promise<BookingDetailDto> => (await axiosInstance.get(`/api/bookings/${id}`)).data,
  getBookingHistory: async (id: number): Promise<BookingStatusHistoryDto[]> => (await axiosInstance.get(`/api/bookings/${id}/history`)).data,
  updateBookingStatus: async (id: number, payload: { status: string; note?: string }): Promise<void> => {
    await axiosInstance.patch(`/api/bookings/${id}/status`, payload);
  },
  cancelBooking: async (id: number, payload: { reason?: string }): Promise<MessageResponse> => (await axiosInstance.post(`/api/bookings/${id}/cancel`, payload)).data,

  getMyAvailability: async (): Promise<AvailabilitySlotDto[]> => (await axiosInstance.get('/api/availability/my-slots')).data,
  createAvailability: async (payload: { startTime: string; endTime: string }): Promise<AvailabilitySlotDto> =>
    (await axiosInstance.post('/api/availability/slots', payload)).data,
  deleteAvailability: async (slotId: number): Promise<void> => {
    await axiosInstance.delete(`/api/availability/slots/${slotId}`);
  },

  createConversationByBooking: async (bookingId: number): Promise<Conversation> =>
    (await axiosInstance.post(`/api/chat/conversations/by-booking/${bookingId}`)).data,
  getConversations: async (): Promise<Conversation[]> =>
    (await axiosInstance.get('/api/chat/conversations')).data,
  createSupportConversation: async (userId?: number): Promise<Conversation> =>
    (await axiosInstance.post('/api/chat/conversations/support', { userId })).data,
  getMessages: async (conversationId: number): Promise<ChatMessage[]> =>
    (await axiosInstance.get(`/api/chat/conversations/${conversationId}/messages`)).data,
  sendMessage: async (conversationId: number, payload: { content: string }): Promise<ChatMessage> =>
    (await axiosInstance.post(`/api/chat/conversations/${conversationId}/messages`, payload)).data,

  createDispute: async (payload: { bookingId: number; reason: string }): Promise<Dispute> => (await axiosInstance.post('/api/disputes', payload)).data,
  getDisputes: async (): Promise<Dispute[]> => (await axiosInstance.get('/api/disputes')).data,
  updateDispute: async (id: number, payload: { status: string; adminNote?: string }): Promise<void> => {
    await axiosInstance.patch(`/api/disputes/${id}`, payload);
  },

  getNotifications: async (): Promise<Notification[]> => (await axiosInstance.get('/api/notifications/mine')).data,
  markNotificationRead: async (id: number): Promise<void> => {
    await axiosInstance.patch(`/api/notifications/${id}/read`);
  },

  getNurseProfile: async (): Promise<NurseProfileDetailDto> => (await axiosInstance.get('/api/nurse/profile')).data,
  updateNurseProfile: async (payload: { bio: string; yearsExperience: number; serviceRadiusKm: number }): Promise<MessageResponse> =>
    (await axiosInstance.put('/api/nurse/profile', payload)).data,
  uploadNurseDocument: async (payload: { type: string; file: File }): Promise<MessageResponse> => {
    const formData = new FormData();
    formData.append('Type', payload.type);
    formData.append('File', payload.file);
    return (await axiosInstance.post('/api/nurse/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })).data;
  },
  createNurseService: async (payload: { serviceId: number; price: number; unit: string }): Promise<NurseServiceDto> =>
    (await axiosInstance.post('/api/nurse/services', payload)).data,
  getNurseServices: async (): Promise<NurseServiceDto[]> => (await axiosInstance.get('/api/nurse/services')).data,
  updateNurseService: async (serviceId: number, payload: { price: number; unit: string; status?: string }): Promise<NurseServiceDto> =>
    (await axiosInstance.put(`/api/nurse/services/${serviceId}`, payload)).data,
  deleteNurseService: async (serviceId: number): Promise<void> => {
    await axiosInstance.delete(`/api/nurse/services/${serviceId}`);
  },

  getNurses: async (params?: {
    serviceId?: number;
    minPrice?: number;
    maxPrice?: number;
    startTime?: string;
    endTime?: string;
    latitude?: number;
    longitude?: number;
    district?: string;
    sortBy?: string;
  }): Promise<NurseDiscoveryDto[]> => (await axiosInstance.get('/api/nurses', { params })).data,
  getNurseByUserId: async (userId: number): Promise<NurseProfileDetailDto> => (await axiosInstance.get(`/api/nurses/${userId}`)).data,
  getNurseAvailabilityByUserId: async (userId: number): Promise<AvailabilitySlotDto[]> =>
    (await axiosInstance.get(`/api/nurses/${userId}/availability`)).data,

  payBooking: async (bookingId: number, payload: { amount: number; method: string; status?: string; transactionId?: string }): Promise<Payment> =>
    (await axiosInstance.put(`/api/payments/booking/${bookingId}`, payload)).data,
  createPayOSPaymentLink: async (bookingId: number, payload?: { returnUrl?: string; cancelUrl?: string }): Promise<PayOSPaymentLink> =>
    (await axiosInstance.post(`/api/payments/booking/${bookingId}/payos-link`, payload ?? {})).data,
  createPayOSBookingPaymentLink: async (payload: Record<string, unknown>): Promise<PayOSPaymentLink> =>
    (await axiosInstance.post('/api/payments/booking/payos-link', payload)).data,

  createReview: async (payload: { bookingId: number; rating: number; comment?: string }): Promise<MessageResponse> =>
    (await axiosInstance.post('/api/reviews', payload)).data,
  getReviews: async (params?: { nurseId?: number; serviceId?: number; bookingId?: number }): Promise<ReviewDto[]> => {
    const response = await requestFirst([
      ...(params?.nurseId ? [
        async () => (await axiosInstance.get(`/api/reviews/nurse/${params.nurseId}`, { params: { pageSize: 100 } })).data,
        async () => (await axiosInstance.get(`/api/nurses/${params.nurseId}/reviews`, { params: { pageSize: 100 } })).data,
      ] : []),
      async () => (await axiosInstance.get('/api/reviews', { params })).data,
      async () => (await axiosInstance.get('/api/reviews/search', { params })).data,
      async () => (await axiosInstance.get('/api/public/reviews', { params })).data,
    ]);
    return toArray(response)
      .map(normalizeReview)
      .filter((item) => !params?.serviceId || item.serviceId === params.serviceId)
      .filter((item) => item.rating > 0);
  },

  getCommunityPosts: async (params?: { search?: string }): Promise<CommunityPostDto[]> =>
    (await axiosInstance.get('/api/community/posts', { params })).data,
  createCommunityPost: async (payload: { title: string; content: string; tags: string[]; image?: File | null }): Promise<CommunityPostDto> => {
    const formData = new FormData();
    formData.append('Title', payload.title);
    formData.append('Content', payload.content);
    payload.tags.forEach((tag) => formData.append('Tags', tag));
    if (payload.image) formData.append('Image', payload.image);

    return (await axiosInstance.post('/api/community/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })).data;
  },
  updateCommunityPost: async (postId: number, payload: { title: string; content: string; tags: string[] }): Promise<CommunityPostDto> =>
    (await axiosInstance.put(`/api/community/posts/${postId}`, payload)).data,
  toggleCommunityPostLike: async (postId: number): Promise<CommunityPostDto> =>
    (await axiosInstance.post(`/api/community/posts/${postId}/like`)).data,
  deleteCommunityPost: async (postId: number): Promise<void> => {
    await axiosInstance.delete(`/api/community/posts/${postId}`);
  },
  toggleCommunityCommentLike: async (postId: number, commentId: number): Promise<CommunityCommentDto> =>
    (await axiosInstance.post(`/api/community/posts/${postId}/comments/${commentId}/like`)).data,
  getCommunityCommentLikers: async (postId: number, commentId: number): Promise<CommunityCommentLikerDto[]> =>
    (await axiosInstance.get(`/api/community/posts/${postId}/comments/${commentId}/likes`)).data,
  createCommunityComment: async (postId: number, payload: { content: string; parentCommentId?: number | null }): Promise<CommunityCommentDto> =>
    (await axiosInstance.post(`/api/community/posts/${postId}/comments`, payload)).data,

  getServices: async (): Promise<ServiceDetailDto[]> => (await axiosInstance.get('/api/services')).data,
  getServiceById: async (id: number): Promise<ServiceDetailDto> => (await axiosInstance.get(`/api/services/${id}`)).data,
  createService: async (payload: { name: string; category: string; description?: string; basePrice: number; estimatedDurationMinutes: number; serviceKind?: string; packageDays?: number; includedServiceKeys?: string; packageScheduleJson?: string; status?: string }): Promise<ServiceDetailDto> =>
    (await axiosInstance.post('/api/services', payload)).data,
  updateService: async (id: number, payload: { name: string; category: string; description?: string; basePrice: number; estimatedDurationMinutes: number; serviceKind?: string; packageDays?: number; includedServiceKeys?: string; packageScheduleJson?: string; status?: string }): Promise<void> => {
    await axiosInstance.put(`/api/services/${id}`, payload);
  },
  deleteService: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/services/${id}`);
  },
  getAdminUsers: async (): Promise<AdminUserDto[]> => {
    const response = await requestFirst([
      async () => (await axiosInstance.get('/api/admin/users')).data,
      async () => (await axiosInstance.get('/api/users')).data,
    ]);
    return toArray(response).map(normalizeAdminUser);
  },
  createAdminUser: async (payload: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role: 'customer' | 'nurse_unconfirmed';
  }): Promise<AdminUserDto> => normalizeAdminUser((await axiosInstance.post('/api/admin/users', payload)).data),
  updateAdminUserStatus: async (id: number, payload: { status: 'active' | 'blocked' }): Promise<AdminUserDto> =>
    normalizeAdminUser((await axiosInstance.patch(`/api/admin/users/${id}/status`, payload)).data),

  // === User Profile ===
  /** GET /api/users/me/profile */
  getMyProfile: async (): Promise<{ fullName: string; email: string; phone: string | null; phoneNumber?: string | null; address: string | null; ward?: string | null; district?: string | null; latitude?: number | null; longitude?: number | null; defaultAddress?: { fullAddress: string; ward: string | null; district: string | null; latitude: number | null; longitude: number | null } | null; bankBin: string | null; bankAccountNumber: string | null; bankAccountName: string | null }> =>
    (await axiosInstance.get('/api/users/me/profile')).data,

  /** PUT /api/users/me/profile */
  updateMyProfile: async (payload: { fullName?: string; phone?: string; phoneNumber?: string; address?: string; ward?: string; district?: string; latitude?: number | null; longitude?: number | null; bankBin?: string; bankAccountNumber?: string; bankAccountName?: string }): Promise<void> => {
    const { phone, ...rest } = payload;
    await axiosInstance.put('/api/users/me/profile', {
      ...rest,
      phoneNumber: rest.phoneNumber ?? phone,
    });
  },

  previewHealthCheckInFollowUp: async (payload: AnalyzeHealthCheckInPayload): Promise<HealthCheckInFollowUpPreviewResponse> =>
    (await axiosInstance.post('/api/health-checkins/follow-up-preview', payload)).data,

  analyzeHealthCheckIn: async (payload: AnalyzeHealthCheckInPayload): Promise<HealthAnalysisResponse> =>
    (await axiosInstance.post('/api/health-checkins/analyze', payload)).data,

  recommendCarePlan: async (payload: CarePlanRecommendRequest): Promise<CarePlanResponse> =>
    (await axiosInstance.post('/api/care-plans/recommend', payload)).data,

  generateBookingCarePlan: async (bookingId: number): Promise<CarePlanResponse> =>
    (await axiosInstance.post(`/api/bookings/${bookingId}/care-plan/generate`)).data,

  getBookingCarePlan: async (bookingId: number): Promise<CarePlanResponse> =>
    (await axiosInstance.get(`/api/bookings/${bookingId}/care-plan`)).data,

  getLatestHealthCheckIn: async (): Promise<LatestHealthCheckInDto> =>
    (await axiosInstance.get('/api/health-checkins/latest')).data,

  getHealthCheckInHistory: async (params?: { page?: number; pageSize?: number }): Promise<HealthCheckInHistoryDto[]> =>
    (await axiosInstance.get('/api/health-checkins/history', { params })).data,

  createAiChatConversation: async (): Promise<AiChatCreateResponse> =>
    (await axiosInstance.post('/api/ai-chat/conversations')).data,

  getAiChatConversations: async (): Promise<AiChatConversationDto[]> =>
    (await axiosInstance.get('/api/ai-chat/conversations')).data,

  sendAiChatMessage: async (conversationId: string, payload: { content: string }): Promise<AiChatMessageDto> =>
    (await axiosInstance.post(`/api/ai-chat/conversations/${conversationId}/messages`, payload)).data,

  sendAiChatMessageNewConversation: async (payload: { content: string }): Promise<AiChatMessageDto> =>
    (await axiosInstance.post('/api/ai-chat/messages', payload)).data,

  // === Package Session Tracking ===
  getPackageProgress: async (bookingId: number): Promise<PackageProgressDto> =>
    (await axiosInstance.get(`/api/bookings/${bookingId}/sessions`)).data,

  checkInSession: async (bookingId: number, payload?: { nurseNote?: string }): Promise<PackageSessionDto> =>
    (await axiosInstance.post(`/api/bookings/${bookingId}/sessions/checkin`, payload || {})).data,

  checkOutSession: async (bookingId: number, payload?: { nurseNote?: string }): Promise<PackageSessionDto> =>
    (await axiosInstance.post(`/api/bookings/${bookingId}/sessions/checkout`, payload || {})).data,

  submitPackageSessionFeedback: async (bookingId: number, sessionId: number, payload: { rating: number; note?: string; tags?: string[] }): Promise<PackageSessionDto> =>
    (await axiosInstance.post(`/api/bookings/${bookingId}/sessions/${sessionId}/feedback`, payload)).data,

  submitSingleSessionFeedback: async (bookingId: number, payload: { rating: number; note?: string; tags?: string[] }): Promise<BookingDetailDto> =>
    (await axiosInstance.post(`/api/bookings/${bookingId}/sessions/feedback`, payload)).data,

  // === Notification Management ===
  /** DELETE /api/notifications/{id} */
  deleteNotification: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/notifications/${id}`);
  },

  /** DELETE /api/notifications */
  deleteAllNotifications: async (): Promise<void> => {
    await axiosInstance.delete('/api/notifications');
  },
};

export default caremateApi;
