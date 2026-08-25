export interface DriverLocationData {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface BookingEventData {
  bookingId: string;
  driverId?: string;
  clientId?: string;
}

export interface ChatMessageData {
  bookingId: string;
  senderId: string;
  message: string;
  timestamp: number;
}
