'use client';

import { useState, useEffect, useCallback } from 'react';
import { donorService, type DonorListParams } from '@/services';
import type { Donor, CreateDonorInput } from '@/types';

interface UseDonorsReturn {
  donors: Donor[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDonors(params: DonorListParams = {}): UseDonorsReturn {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Stable serialised key so effect only re-runs when params change
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    donorService
      .list(JSON.parse(key) as DonorListParams)
      .then((res) => {
        if (cancelled) return;
        setDonors(res.items);
        setTotal(res.meta.total);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load donors');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { donors, total, isLoading, error, refetch };
}

interface UseCreateDonorReturn {
  createDonor: (input: CreateDonorInput) => Promise<Donor>;
  isSubmitting: boolean;
}

export function useCreateDonor(): UseCreateDonorReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createDonor = useCallback(async (input: CreateDonorInput): Promise<Donor> => {
    setIsSubmitting(true);
    try {
      return await donorService.create(input);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createDonor, isSubmitting };
}
