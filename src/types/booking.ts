export const BookingStatus = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  Disputed: 'Disputed'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export interface BookingDetail {
  id: number;
  slotId: number;
  nurseId: number;
  customerId: number;
  nurseName: string;
  customerName: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalPrice: number;
  note?: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  slotId: number;
  note?: string;
}
