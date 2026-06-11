'use client'

import { useState } from 'react'
import { useAiHistory, useAiQuota } from '@/hooks/useAi'
import { useOrganisations } from '@/hooks/useOrganisations'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'
import { QuotaOverview } from '@/components/ai/QuotaOverview'
import { AiHistoryList } from '@/components/ai/AiHistoryList'

export function AiSection() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  const { data: orgData } = useOrganisations({ page: 1, page_size: 10 })
  const organisations = orgData?.items ?? []
  const orgId = selectedOrgId || organisations[0]?.id || ''

  const { data: quota,   isLoading: quotaLoading   } = useAiQuota(orgId)
  const { data: history, isLoading: historyLoading } = useAiHistory(orgId)

  return (
    <div className="space-y-5">
      {/* Org selector */}
      <div className="max-w-sm">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Organisation
        </label>
        <OrganisationSelector
          value={orgId}
          onChange={setSelectedOrgId}
          placeholder="Sélectionner une organisation"
        />
      </div>

      {/* Quota cards + tokens banner */}
      <QuotaOverview quota={quota} isLoading={quotaLoading} />

      {/* Generation history */}
      <AiHistoryList history={history} isLoading={historyLoading} />
    </div>
  )
}