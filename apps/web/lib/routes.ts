import { apiClient } from '@/lib/api-client';
import { API_URL } from '@/config';
import type { CreateHospitalInput } from '@/schemas';
import type {
  CreateRequest,
  Request,
  RequestListParams,
  RequestResponse,
  HospitalResponse,
  HospitalValley,
} from '@/types';

export const ROUTES = {
  base: API_URL,
  auth: {
    me: '/auth/me',
    googleToken: '/auth/google/token',
  },
  hospitals: {
    base: '/hospitals',
    byId: (id: string) => `/hospitals/${id}`,
  },
  requests: {
    base: '/requests',
    byId: (id: string) => `/requests/${id}`,
  },
} as const;

export type HospitalOption = {
  id: string;
  name: string;
  location: string;
  valley?: HospitalValley;
  contactPerson?: string | null;
  phone?: string | null;
};

export { type CreateHospitalInput } from '@/schemas';
export type CreateRequestInput = CreateRequest;

function buildRequestQuery(params: RequestListParams): string {
  const query = new URLSearchParams();

  if (params.page != null) query.set('page', String(params.page));
  if (params.limit != null) query.set('limit', String(params.limit));
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.urgency && params.urgency !== 'all') query.set('urgency', params.urgency);
  if (params.bloodType && params.bloodType !== 'all') query.set('bloodType', params.bloodType);
  if (params.location && params.location !== 'all') query.set('location', params.location);
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);

  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

function buildHospitalQuery(params: { search?: string; valley?: string } = {}): string {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.valley) query.set('valley', params.valley);
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

export const hospitalApi = {
  list: async (params: { search?: string; valley?: string; page?: number; limit?: number } = {}) => {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const res = await apiClient.get<HospitalOption[] | HospitalResponse>(
      `${ROUTES.hospitals.base}${buildHospitalQuery(params)}`
    );

    if (Array.isArray(res)) {
      const total = res.length;
      return {
        items: res,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
          hasNextPage: false,
          hasPrevPage: page > 1,
        },
      };
    }

    return res;
  },
  create: (payload: CreateHospitalInput) => apiClient.post<HospitalOption>(ROUTES.hospitals.base, payload),
};

export const requestApi = {
  list: async (params: RequestListParams = {}): Promise<RequestResponse> => {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const res = await apiClient.get<Request[] | RequestResponse>(
      `${ROUTES.requests.base}${buildRequestQuery(params)}`
    );

    if (Array.isArray(res)) {
      const total = res.length;
      return {
        items: res,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
          hasNextPage: false,
          hasPrevPage: page > 1,
        },
      };
    }

    return res;
  },
  create: (payload: CreateRequestInput) => apiClient.post<Request>(ROUTES.requests.base, payload),
};
