'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donorService, type DonorListParams } from '@/services';
import type { Donor, CreateDonorInput, UploadBulkResponse } from '@/types';
import { donorKeys } from '@/queries';

// ── useDonors ─────────────────────────────────────────────────────────────────

export function useDonors(params: DonorListParams = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: donorKeys.list(params),
    queryFn: () => donorService.list(params),
  });

  return {
    donors: data?.items ?? [],
    total: data?.meta.total ?? 0,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

// ── useCreateDonor ────────────────────────────────────────────────────────────

export function useCreateDonor() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreateDonorInput) => donorService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: donorKeys.lists() });
    },
  });

  return {
    createDonor: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    
  };
}

// ── useUploadCsvDonors ────────────────────────────────────────────────────────

export function useUploadCsvDonors() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => donorService.uploadCsv(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: donorKeys.lists() });
    },
  });

  return {
    mutate: (file: File, options?: { onSuccess?: (data: UploadBulkResponse) => void }) => {
      mutation.mutate(file, { onSuccess: options?.onSuccess });
    },
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error instanceof Error ? mutation.error : null,
    reset: mutation.reset,
  };
}

// ── useUpdateDonor ────────────────────────────────────────────────────────────

export function useUpdateDonor() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateDonorInput> }) =>
      donorService.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: donorKeys.lists() });
    },
  });

  return {
    updateDonor: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

// ── useBlacklistDonor ─────────────────────────────────────────────────────────

export function useBlacklistDonor() {
  const queryClient = useQueryClient();

  const blacklist = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      donorService.blacklist(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: donorKeys.lists() });
    },
  });

  const unblacklist = useMutation({
    mutationFn: (id: string) => donorService.unblacklist(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: donorKeys.lists() });
    },
  });

  return {
    blacklist: blacklist.mutateAsync,
    unblacklist: unblacklist.mutateAsync,
    isPending: blacklist.isPending || unblacklist.isPending,
  };
}

