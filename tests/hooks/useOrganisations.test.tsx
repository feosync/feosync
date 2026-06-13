import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useOrganisations } from '@/hooks/useOrganisations'
import { apiClient } from '@/lib/api/client'
import type { ReactNode } from 'react'

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    getOrganisations: vi.fn(),
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useOrganisations', () => {
  it('returns organisations list', async () => {
    const mockData = {
      items: [{ id: '1', name: 'Test Org', sector: 'technology' }],
      total: 1,
      total_pages: 1,
    }
    vi.mocked(apiClient.getOrganisations).mockResolvedValue(mockData)

    const { result } = renderHook(() => useOrganisations({ page: 1, page_size: 10 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })
})
