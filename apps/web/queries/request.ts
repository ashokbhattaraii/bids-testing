import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestApi, type CreateRequestInput, type UpdateRequestInput } from '@/lib/routes';
import { REQUEST_QUERY_KEYS } from '@/lib/constant';
import type { Request, RequestListParams, RequestResponse } from '@/types';

export function useRequestsQuery(params: RequestListParams = {}) {
	return useQuery<Request[]>({
		queryKey: [...REQUEST_QUERY_KEYS.list, params],
		queryFn: async () => {
			const response = await requestApi.list(params);
			return response.items;
		},
		placeholderData: keepPreviousData,
	});
}

export function useRequestsResponseQuery(params: RequestListParams = {}) {
	return useQuery<RequestResponse>({
		queryKey: [...REQUEST_QUERY_KEYS.list, 'response', params],
		queryFn: () => requestApi.list(params),
		placeholderData: keepPreviousData,
	});
}

export function useRequestQuery(id?: string, options: { enabled?: boolean } = {}) {
	return useQuery<Request>({
		queryKey: [...REQUEST_QUERY_KEYS.detail, id],
		queryFn: () => requestApi.get(id!),
		enabled: Boolean(id) && (options.enabled ?? true),
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

export function useUpdateRequestMutation(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [...REQUEST_QUERY_KEYS.update, id],
		mutationFn: (payload: UpdateRequestInput) => requestApi.update(id, payload),
		onSuccess: async (updatedRequest) => {
			queryClient.setQueryData([...REQUEST_QUERY_KEYS.detail, id], updatedRequest);
			await queryClient.invalidateQueries({ queryKey: REQUEST_QUERY_KEYS.list });
			await queryClient.invalidateQueries({ queryKey: [...REQUEST_QUERY_KEYS.detail, id] });
		},
	});
}
