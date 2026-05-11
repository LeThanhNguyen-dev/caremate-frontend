export interface AvailabilitySlot {
  id: number;
  nurseId: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  price?: number;
}

export interface CreateAvailabilityRequest {
  startTime: string;
  endTime: string;
}
