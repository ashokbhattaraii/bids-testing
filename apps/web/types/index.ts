//bids/apps/web/types/index.ts
export interface BaseResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export type RequestUrgency = 'critical' | 'high' | 'moderate' | 'low';
export type RequestStatus = 'pending' | 'in_progress' | 'fulfilled' | 'cancelled';
export type RequestLocation = 'inside_valley' | 'outside_valley';
export type TransportationRequired = 'yes' | 'no' | 'maybe';

export interface Request {
  id: string;
  patientName: string;
  requesterName?: string | null;
  requesterPhone?: string | null;
  diagnosis?: string | null;
  hospitalId?: string | null;
  hospital: string;
  bloodType: string;
  quantity: number;
  urgency: RequestUrgency;
  status: RequestStatus;
  requestedAt: string;
  neededBy: string;
  notes?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  location: RequestLocation;
}

export interface CreateRequest {
  patientName: string;
  requesterName?: string;
  requesterPhone?: string;
  diagnosis?: string;
  hospitalId?: string;
  hospital: string;
  bloodType: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  totalPints?: number;
  urgency?: RequestUrgency;
  status?: RequestStatus;
  bloodRequiredOn?: string;
  neededBy?: string;
  additionalNotes?: string;
  location?: RequestLocation;
  transportationRequired?: TransportationRequired;
  requestedAt?: string;
  selectedComponents?: string[];
  componentQuantities?: Record<string, string | number>;
  images?: Array<{ name?: string; preview?: string }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RequestResponse {
  items: Request[];
  meta: PaginationMeta;
}

export interface RequestListParams {
  page?: number;
  limit?: number;
  status?: RequestStatus | 'all';
  urgency?: RequestUrgency | 'all';
  bloodType?: string | 'all';
  location?: RequestLocation | 'all';
  search?: string;
  from?: string;
  to?: string;
}

// ------------------------- Hospitals ---------------------------------

export type HospitalValley = 'inside_valley' | 'outside_valley';

export interface Hospital {
  id: string;
  name: string;
  location: string;
  contactPerson?: string | null;
  phone?: string | null;
  valley?: HospitalValley;
  createdAt?: string;
  updatedAt?: string;
}

export interface HospitalOption {
  id: string;
  name: string;
  location: string;
  contactPerson?: string | null;
  phone?: string | null;
}

export interface CreateHospital {
  name: string;
  location: string;
  contactPerson?: string;
  phone?: string;
  valley?: HospitalValley;
}

export interface HospitalResponse {
  items: HospitalOption[];
  meta: PaginationMeta;
}

export interface HospitalListParams {
  page?: number;
  limit?: number;
  search?: string;
  valley?: HospitalValley | 'all';
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
