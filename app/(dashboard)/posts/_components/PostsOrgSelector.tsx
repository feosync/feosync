import { OrganisationSelector } from '@/components/organizations/OrgSelector'

interface PostsOrgSelectorProps {
  value: string
  onChange: (v: string) => void
}

export function PostsOrgSelector({ value, onChange }: PostsOrgSelectorProps) {
  return (
    <div className="w-full max-w-sm">
      <label className="text-sm text-muted-foreground mb-1.5 block">Organisation</label>
      <OrganisationSelector
        value={value}
        onChange={onChange}
        placeholder="Sélectionner une organisation"
      />
    </div>
  )
}