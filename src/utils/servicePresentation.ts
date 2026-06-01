import type { PackageScheduleEntryDto, ServiceDetailDto } from '../api/frontend-api-contract';

export const categoryLabels: Record<string, string> = {
  'cham-me-sau-sinh': 'Chăm mẹ sau sinh',
  'cham-be-so-sinh': 'Chăm bé sơ sinh',
  'phuc-hoi-suc-khoe': 'Phục hồi sức khỏe',
  'tu-van-tai-nha': 'Tư vấn tại nhà',
  'ho-tro-tinh-than': 'Hỗ trợ tinh thần',
  'goi-dich-vu': 'Gói dịch vụ',
  'ho-tro-gia-dinh': 'Hỗ trợ gia đình',
};

export const includedServiceLabels: Record<string, string> = {
  'baby-bathing': 'Tắm bé đúng cách, vệ sinh toàn thân',
  'mother-health-monitoring': 'Theo dõi sức khỏe và phục hồi của mẹ',
  'baby-health-monitoring': 'Theo dõi cân nặng và phát triển của bé',
  'breastfeeding-support': 'Hỗ trợ tư thế bú và xử lý vấn đề thường gặp',
  'postpartum-massage': 'Massage thư giãn, hỗ trợ phục hồi sau sinh',
  'nutrition-consultation': 'Tư vấn dinh dưỡng cho mẹ và bé',
  'night-care': 'Chăm bé ban đêm để mẹ có thêm thời gian nghỉ',
  'house-support': 'Hỗ trợ việc nhẹ quanh không gian chăm sóc',
  'mental-wellness': 'Đồng hành tinh thần và giảm căng thẳng',
  'emergency-consultation': 'Tư vấn khi gia đình cần hỗ trợ nhanh',
};

export const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

export const getCategoryLabel = (category?: string | null) => {
  if (!category) return 'Dịch vụ';
  return categoryLabels[category] ?? category;
};

export const getIncludedServiceLabels = (service: ServiceDetailDto) =>
  service.includedServiceKeys
    ?.split(',')
    .map((key) => includedServiceLabels[key.trim()] ?? key.trim())
    .filter(Boolean) ?? [];

export const getVisiblePackageSchedule = (service?: ServiceDetailDto | null): PackageScheduleEntryDto[] => {
  if (!service) return [];
  if (service.packageSchedule?.length > 0) return service.packageSchedule;
  return [];
};

export const getScheduleTitle = (item: PackageScheduleEntryDto) => {
  const title = item.title?.trim();
  if (!title) return `Buổi ${item.day}`;

  const segments = title.split(':');
  return segments.length > 1 ? segments.slice(1).join(':').trim() : title;
};
