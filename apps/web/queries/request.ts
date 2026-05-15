import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestApi, type CreateRequestInput } from '@/lib/routes';
import { REQUEST_QUERY_KEYS } from '@/lib/constant';
import type { Request } from '@/lib/dummy-data';

export function useRequestsQuery() {
	return useQuery<Request[]>({
		queryKey: REQUEST_QUERY_KEYS.list,
		queryFn: () => requestApi.list(),
	});
}

export function useCreateRequestMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: REQUEST_QUERY_KEYS.create,
		mutationFn: (payload: CreateRequestInput) => requestApi.create(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: REQUEST_QUERY_KEYS.list });
		},
	});
}
