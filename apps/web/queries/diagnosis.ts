import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { diagnosisApi, type DiagnosisOption } from '@/lib/routes';

export const DIAGNOSIS_QUERY_KEYS = {
  all: ['diagnoses'] as const,
  list: ['diagnoses', 'list'] as const,
  create: ['diagnoses', 'create'] as const,
} as const;

export function useDiagnosesQuery() {
  return useQuery<DiagnosisOption[]>({
    queryKey: DIAGNOSIS_QUERY_KEYS.list,
    queryFn: () => diagnosisApi.list(),
  });
}

export function useCreateDiagnosisMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: DIAGNOSIS_QUERY_KEYS.create,
    mutationFn: (payload: { name: string }) => diagnosisApi.create(payload),
    onSuccess: async (createdDiagnosis) => {
      queryClient.setQueryData<DiagnosisOption[]>(DIAGNOSIS_QUERY_KEYS.list, (current) => [
        createdDiagnosis,
        ...(current ?? []).filter((item) => item.id !== createdDiagnosis.id),
      ]);

      await queryClient.invalidateQueries({ queryKey: DIAGNOSIS_QUERY_KEYS.list });
    },
  });
}