'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useFetch<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = [],
): UseFetchState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const result = await asyncFunction();
      setState({ data: result, isLoading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Unknown error'),
      });
    }
  }, [asyncFunction]);

  useEffect(() => {
    fetch();
  }, dependencies);

  return {
    ...state,
    refetch: fetch,
  };
}
