'use client'

import { useState } from 'react'
import { Plus, LayoutTemplate, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { useOrganisations } from '@/hooks/useOrganisations'
import {
  useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate,
} from '@/hooks/useTemplates'
import { TemplateSheet } from '@/components/templates/TemplateSheet'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'
import type { PostTemplate, SectorEnum } from '@/lib/api/types'

const SECTORS: { value: SectorEnum | 'all'; label: string }[] = [
  { value: 'all',           label: 'Tous' },
  { value: 'technology',    label: 'Technologie' },
  { value: 'finance',       label: 'Finance' },
  { value: 'healthcare',    label: 'Santé' },
  { value: 'education',     label: 'Éducation' },
  { value: 'retail',        label: 'Commerce' },
  { value: 'manufacturing', label: 'Industrie' },
]

/* ── Page principale ─────────────────────────────────────────────────────── */
export default function TemplatesPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  const { data: orgData }  = useOrganisations({ page: 1, page_size: 10 })
  const organisations      = orgData?.items ?? []
  const orgId              = selectedOrgId || organisations[0]?.id || ''

  const { data: templates = [], isLoading } = useTemplates(orgId)
  const createMutation = useCreateTemplate(orgId)
  const updateMutation = useUpdateTemplate(orgId)
  const deleteMutation = useDeleteTemplate(orgId)

  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(null)
  const [sheetOpen, setSheetOpen]   = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [filter, setFilter]         = useState<SectorEnum | 'all'>('all')
  const [search, setSearch]         = useState('')
  const [tab, setTab]               = useState<'all' | 'app' | 'org'>('all')

  const filtered = templates.filter(t => {
    const matchSector = filter === 'all' || t.sector === filter
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchTab    = tab === 'all' || (tab === 'app' ? t.is_app_template : !t.is_app_template)
    return matchSector && matchSearch && matchTab
  })

  const openCreate = () => { setSelectedTemplate(null); setIsCreating(true);  setSheetOpen(true) }
  const openEdit   = (t: PostTemplate) => { setSelectedTemplate(t); setIsCreating(false); setSheetOpen(true) }
  const closeSheet = () => { setSheetOpen(false); setSelectedTemplate(null); setIsCreating(false) }

  const TABS = [
    { value: 'all', label: `Tous (${templates.length})` },
    { value: 'app', label: `App (${templates.filter(t => t.is_app_template).length})` },
    { value: 'org', label: `Organisation (${templates.filter(t => !t.is_app_template).length})` },
  ] as const

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {templates.length} template{templates.length > 1 ? 's' : ''} disponibles
          </p>
        </div>
        <Button
          onClick={openCreate}
          disabled={!orgId}
          className="bg-primary hover:bg-primary/90 text-primary-foreground
                     gap-1.5 transition-colors disabled:opacity-50 disabled:pointer-events-none shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nouveau template
        </Button>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
              tab === t.value
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Filtres ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">

        {tab === 'org' && (
          <OrganisationSelector
            value={selectedOrgId}
            onChange={setSelectedOrgId}
            placeholder="Sélectionner une organisation"
          />
        )}

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5
                             text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un template..."
            className="pl-9 pr-9 text-sm"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearch('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7
                         text-muted-foreground hover:text-foreground hover:bg-accent
                         transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Filtres secteurs */}
        <div className="flex gap-1 flex-wrap">
          {SECTORS.map(s => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                filter === s.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>

      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20
                        bg-muted/40 rounded-xl border border-dashed border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-full
                          flex items-center justify-center mb-4">
            <LayoutTemplate className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">
            Aucun template trouvé
          </p>
          {search === '' && tab !== 'app' && (
            <Button
              onClick={openCreate}
              variant="ghost"
              className="mt-2 text-primary hover:text-primary hover:bg-primary/10
                         text-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Créer un template
            </Button>
          )}
        </div>

      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() => openEdit(template)}
            />
          ))}
        </div>
      )}

      {/* ── Sheet ──────────────────────────────────────────────────────── */}
      <TemplateSheet
        open={sheetOpen}
        onClose={closeSheet}
        template={selectedTemplate}
        orgId={orgId}
        onCreate={async (data) => { await createMutation.mutateAsync(data); closeSheet() }}
        onUpdate={async (id, data) => { await updateMutation.mutateAsync({ id, data }); closeSheet() }}
        onDelete={async (id) => { await deleteMutation.mutateAsync(id); closeSheet() }}
        isCreating={createMutation.isPending}
        isUpdating={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}

/* ── TemplateCard ────────────────────────────────────────────────────────── */
function TemplateCard({ template, onClick }: { template: PostTemplate; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer
                 hover:border-primary/50 hover:shadow-sm transition-all group"
    >
      {/* Aperçu image */}
      <div className="relative aspect-video bg-muted">
        {template.asset_url ? (
          <Image
            src={template.asset_url}
            alt={template.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LayoutTemplate className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}

        {/* Badge type */}
        <div className="absolute top-2 left-2">
          <Badge className={`text-[10px] border-0 ${
            template.is_app_template
              ? 'bg-primary text-primary-foreground'
              : 'bg-foreground/80 text-background'
          }`}>
            {template.is_app_template ? 'App' : 'Org'}
          </Badge>
        </div>
      </div>

      {/* Infos */}
      <div className="p-3">
        <p className="text-sm font-medium text-foreground line-clamp-1
                      group-hover:text-primary transition-colors">
          {template.name}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-muted-foreground">
            {template.usage_count} utilisation{template.usage_count > 1 ? 's' : ''}
          </span>
          <Badge
            variant="secondary"
            className="text-[10px] bg-muted text-muted-foreground border-0"
          >
            {template.sector}
          </Badge>
        </div>
      </div>
    </div>
  )
}