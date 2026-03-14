// Shared API types for Beacon Point

export type UserRole = 'advertiser' | 'owner' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  ownerUserId: string;
}

export interface Screen {
  id: string;
  ownerId: string;
  locationName: string;
  venueType: string;
  city: string;
  state: string;
  screenSize: string;
  resolution: string;
  deviceId: string;
  estimatedDailyViews: number;
  status: string;
  createdAt: string;
}

export interface ScreenListing {
  id: string;
  screenId: string;
  title: string;
  description: string;
  pricePerHour: number;
  pricePerDay: number;
  active: boolean;
}

export interface Advertisement {
  id: string;
  companyId: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: string;
  durationSec: number;
  status: string;
  createdAt: string;
}

export interface AdSchedule {
  id: string;
  adId: string;
  screenId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  frequencyPerHour: number;
}

export interface Payment {
  id: string;
  companyId: string;
  amount: number;
  status: string;
  stripePaymentId: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  advertiserId: string;
  screenId: string;
  adId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
}
