import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hospitalApi, type CreateHospitalInput, type HospitalOption } from '@/lib/routes';
import type { HospitalResponse } from '@/types';

export const HOSPITAL_QUERY_KEYS = {
  all: ['hospitals'] as const,
  list: ['hospitals', 'list'] as const,
  create: ['hospitals', 'create'] as const,
} as const;

export function useHospitalsQuery(params?: { search?: string; valley?: string }) {
  return useQuery<HospitalOption[]>({
    queryKey: [...HOSPITAL_QUERY_KEYS.list, params ?? {}],
    queryFn: async (): Promise<HospitalOption[]> => {
      const response = await hospitalApi.list(params);
      return Array.isArray(response) ? response : response.items;
    },
  });
}

export function useHospitalsResponseQuery(params?: { search?: string; valley?: string; page?: number; limit?: number }) {
  return useQuery<HospitalResponse>({
    queryKey: [...HOSPITAL_QUERY_KEYS.list, 'response', params ?? {}],
    queryFn: async (): Promise<HospitalResponse> => {
      const response = await hospitalApi.list(params);
      if (Array.isArray(response)) {
        return {
          items: response,
          meta: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: response.length,
            totalPages: Math.max(1, Math.ceil(response.length / (params?.limit ?? 20))),
            hasNextPage: false,
            hasPrevPage: (params?.page ?? 1) > 1,
          },
        };
      }

      return response as HospitalResponse;
    },
  });
}

export function useCreateHospitalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: HOSPITAL_QUERY_KEYS.create,
    mutationFn: (payload: CreateHospitalInput) => hospitalApi.create(payload),
    onSuccess: async (createdHospital) => {
      queryClient.setQueryData<HospitalOption[]>(HOSPITAL_QUERY_KEYS.list, (current) => [
        createdHospital,
        ...(current ?? []),
      ]);

      await queryClient.invalidateQueries({ queryKey: HOSPITAL_QUERY_KEYS.list });
    },
  });
}
