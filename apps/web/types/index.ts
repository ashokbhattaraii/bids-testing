//bids/apps/web/types/index.ts
export interface BaseResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export type BloodType = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
export type DonorStatus = 'unverified' | 'active' | 'pledged' | 'blacklisted' | 'dormant' | 'do_not_call';
export type CommunicationType = 'phone_call' | 'sms';
export type DonorSource = 'direct' | 'pledged' | 'event' | 'walk_in';
export type DonorCategory = 'active' | 'pledged' | 'event';

/** Shape returned by the API (camelCase — Drizzle ORM property names) */
export interface Donor {
  id: string;
  name: string;
  bloodType: BloodType;
  phone: string;
  location: string;
  lastDonation: string | null;
  lastContacted: string | null;
  rating: number;
  donationCount: number;
  status: DonorStatus;
  blacklistReason: string | null;
  communicationType: CommunicationType;
  notes: string | null;
  source: DonorSource;
  category: DonorCategory;
  createdAt: string;
  updatedAt: string;
}

/** Paginated list response from GET /donors */
export interface DonorListResponse {
  items: Donor[];
  meta: { total: number; page: number; limit: number };
}

/** Payload for POST /donors (camelCase) */
export interface CreateDonorInput {
  name: string;
  bloodType: BloodType;
  phone: string;
  location: string;
  rating: number;
  lastDonation?: string;
  lastContacted?: string;
  donationCount?: number;
  status?: DonorStatus;
  blacklistReason?: string;
  communicationType?: CommunicationType;
  notes?: string;
  source?: DonorSource;
  category?: DonorCategory;
}
