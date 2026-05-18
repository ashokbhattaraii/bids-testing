// Export your API services here
import { apiClient } from '@/lib/api-client';
import type { Donor, DonorListResponse, CreateDonorInput, UploadBulkResponse } from '@/types';

export interface DonorListParams {
  status?: string;
  bloodType?: string;
  search?: string;
  sortBy?: string;
  source?: string;
  page?: number;
  limit?: number;
}

function buildQuery(params: DonorListParams): string {
  const q = new URLSearchParams();
  if (params.status)    q.set('status', params.status);
  if (params.bloodType) q.set('bloodType', params.bloodType);
  if (params.search)    q.set('search', params.search);
  if (params.sortBy)    q.set('sortBy', params.sortBy);
  if (params.source)    q.set('source', params.source);
  if (params.page)      q.set('page', String(params.page));
  // if (params.limit)     q.set('limit', String(params.limit));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const donorService = {
  list: (params: DonorListParams = {}) =>
    apiClient.get<DonorListResponse>(`/donors${buildQuery(params)}`),

  getById: (id: string) =>
    apiClient.get<Donor>(`/donors/${id}`),

  create: (input: CreateDonorInput) =>
    apiClient.post<Donor>('/donors', input),

  update: (id: string, input: Partial<CreateDonorInput>) =>
    apiClient.put<Donor>(`/donors/${id}`, input),

  remove: (id: string) =>
    apiClient.del<null>(`/donors/${id}`),

  blacklist: (id: string, reason: string) =>
    apiClient.post<null>(`/donors/${id}/blacklist`, { reason }),

  unblacklist: (id: string) =>
    apiClient.post<null>(`/donors/${id}/unblacklist`, {}),

  uploadCsv: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.upload<UploadBulkResponse>('/donors/import', form);
  },
};
