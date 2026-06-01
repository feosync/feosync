'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Organisation } from '@/lib/api/types'
import { OrgActionsMenu } from './OrgActionsMenu'
import { sectorLabels, toneLabels } from './labels'
import { ManageSocialMedia } from './socialMedia'

interface Props {
  org: Organisation
  onEdit: () => void
  onDelete: () => void
}

export function OrgCard({ org, onEdit, onDelete }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [socialOpen,   setSocialOpen]   = useState(false)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors">

      {/* ── En-tête : avatar + nom + bouton ··· ─────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {org.brand_color ? (
            <div
              className="w-9 h-9 rounded-full flex-shrink-0 border border-border"
              style={{ backgroundColor: org.brand_color }}
            />
          ) : (
            <div className="w-9 h-9 rounded-full flex-shrink-0 bg-muted border border-border" />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{org.name}</p>
            {org.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {org.description}
              </p>
            )}
          </div>
        </div>

        {/* Bouton ··· — ouvre OrgActionsMenu directement, sans wrapper trigger */}
        <OrgActionsMenu
          org={org}
          onEdit={onEdit}
          onDelete={onDelete}
          controlled={{ open: dropdownOpen, onOpenChange: setDropdownOpen }}
        />
      </div>

      {/* ── Séparateur ───────────────────────────────────────────────────── */}
      <div className="h-px bg-border" />

      {/* ── Pied : badges + date + réseaux ──────────────────────────────── */}
      <div className="flex items-end justify-between gap-2">

        {/* Badges secteur + ton + date */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-0 text-xs"
            >
              {sectorLabels[org.sector] || org.sector}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-muted text-muted-foreground border-0 text-xs"
            >
              {toneLabels[org.tone] || org.tone}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(org.created_at), 'd MMM yyyy', { locale: fr })}
          </span>
        </div>

        {/* Réseaux sociaux — indépendant du dropdown */}
        <div className="shrink-0 relative w-24 h-12">
          <ManageSocialMedia
            key={`${org.id}-mobile`}
            open={socialOpen}
            onOpenChange={setSocialOpen}
            orgId={org.id}
          />
        </div>

      </div>
    </div>
  )
}