import { OrganisationSelector } from '@/components/organizations/OrgSelector'
import type { ScopeFilter } from '@/components/organizations/OrgScopeFilter'

interface PostsOrgSelectorProps {
  value: string
  onChange: (v: string) => void
  scope?: ScopeFilter
}

export function PostsOrgSelector({ value, onChange, scope }: PostsOrgSelectorProps) {
  return (
    <div className="w-full max-w-sm">
      <OrganisationSelector
        value={value}
        onChange={onChange}
        placeholder="Sélectionner une organisation"
        scope={scope}
      />
    </div>
  )
}