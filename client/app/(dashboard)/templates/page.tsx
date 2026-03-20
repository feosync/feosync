'use client'

import { useState } from 'react'
import { Plus, LayoutTemplate, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { useOrganisations } from '@/hooks/useOrganisations'
import {
  useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate
} from '@/hooks/useTemplates'
import { TemplateSheet } from '@/components/templates/TemplateSheet'
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

export default function TemplatesPage() {
  const { data: orgs = [] } = useOrganisations()
  const orgId = orgs[0]?.id || ''

  const { data: templates = [], isLoading } = useTemplates(orgId)
  const createMutation = useCreateTemplate(orgId)
  const updateMutation = useUpdateTemplate(orgId)
  const deleteMutation = useDeleteTemplate(orgId)

  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(null)
  const [sheetOpen, setSheetOpen]   = useState(false)
  const [isCreating, setIsCreating] = useState(false)   // ← mode création vs édition
  const [filter, setFilter]         = useState<SectorEnum | 'all'>('all')
  const [search, setSearch]         = useState('')
  const [tab, setTab]               = useState<'all' | 'app' | 'org'>('all')

  const filtered = templates.filter(t => {
    const matchSector = filter === 'all' || t.sector === filter
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchTab    = tab === 'all' || (tab === 'app' ? t.is_app_template : !t.is_app_template)
    return matchSector && matchSearch && matchTab
  })

  // Ouvre le sheet en mode création
  const openCreate = () => {
    setSelectedTemplate(null)
    setIsCreating(true)
    setSheetOpen(true)
  }

  // Ouvre le sheet en mode édition
  const openEdit = (template: PostTemplate) => {
    setSelectedTemplate(template)
    setIsCreating(false)
    setSheetOpen(true)
  }

  const closeSheet = () => {
    setSheetOpen(false)
    setSelectedTemplate(null)
    setIsCreating(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">Templates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {templates.length} template{templates.length > 1 ? 's' : ''} disponibles
          </p>
        </div>
        {/* ✅ Bouton actif — ouvre le sheet de création */}
        <Button
          onClick={openCreate}
          disabled={!orgId}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Nouveau template
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {([
          { value: 'all', label: `Tous (${templates.length})` },
          { value: 'app', label: `App (${templates.filter(t => t.is_app_template).length})` },
          { value: 'org', label: `Organisation (${templates.filter(t => !t.is_app_template).length})` },
        ] as const).map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-2 text-[13px] border-b-2 -mb-px transition-colors ${
              tab === t.value
                ? 'border-blue-500 text-blue-600 font-medium'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un template..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {SECTORS.map(s => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 text-[12px] rounded-lg border transition-colors ${
                filter === s.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <LayoutTemplate className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">Aucun template trouvé</p>
          {search === '' && tab !== 'app' && (
            <Button onClick={openCreate} variant="ghost" className="mt-3 text-blue-600 text-[13px]">
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

      <TemplateSheet
        open={sheetOpen}
        onClose={closeSheet}
        template={selectedTemplate}          // null = création, objet = édition
        orgId={orgId}
        onCreate={async (data) => {
          await createMutation.mutateAsync(data)
          closeSheet()
        }}
        onUpdate={async (id, data) => {
          await updateMutation.mutateAsync({ id, data })
          closeSheet()
        }}
        onDelete={async (id) => {
          await deleteMutation.mutateAsync(id)
          closeSheet()
        }}
        isCreating={createMutation.isPending}
        isUpdating={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}

function TemplateCard({ template, onClick }: { template: PostTemplate; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group"
    >
      <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
        {template.asset_url ? (
          <Image src={template.asset_url} alt={template.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LayoutTemplate className="w-8 h-8 text-slate-300" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge className={`text-[10px] border-0 ${
            template.is_app_template
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900/80 text-white'
          }`}>
            {template.is_app_template ? 'App' : 'Org'}
          </Badge>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[13px] font-medium text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
          {template.name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-slate-400">
            {template.usage_count} utilisation{template.usage_count > 1 ? 's' : ''}
          </span>
          <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800 border-0">
            {template.sector}
          </Badge>
        </div>
      </div>
    </div>
  )
}