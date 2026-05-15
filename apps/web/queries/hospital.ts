import { useQuery } from '@tanstack/react-query';
import { hospitalApi } from '@/lib/routes';

export const HOSPITAL_QUERY_KEYS = {
  all: ['hospitals'] as const,
} as const;

export type HospitalOption = {
  id: string;
  name: string;
  location: string;
  contactPerson?: string | null;
  phone?: string | null;
};

export function useHospitalsQuery() {
  return useQuery({
    queryKey: HOSPITAL_QUERY_KEYS.all,
    queryFn: () => hospitalApi.list(),
  });
}
