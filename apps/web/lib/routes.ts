import { apiClient } from '@/lib/api-client';
import { API_URL } from '@/config';
import type { CreateRequestInput } from '@/schemas';
import type { Request } from '@/lib/dummy-data';

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
  contactPerson?: string | null;
  phone?: string | null;
};

export { type CreateRequestInput } from '@/schemas';

export const hospitalApi = {
  list: () => apiClient.get<HospitalOption[]>(ROUTES.hospitals.base),
};

export const requestApi = {
  list: () => apiClient.get<Request[]>(ROUTES.requests.base),
  create: (payload: CreateRequestInput) => apiClient.post<Request>(ROUTES.requests.base, payload),
};
