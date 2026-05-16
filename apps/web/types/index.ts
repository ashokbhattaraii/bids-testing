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
