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

interface Props {
  org: Organisation
  onEdit: () => void
  onDelete: () => void
}

export function OrgCard({ org, onEdit, onDelete }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <OrgActionsMenu
      org={org}
      onEdit={onEdit}
      onDelete={onDelete}
      controlled={{ open: dropdownOpen, onOpenChange: setDropdownOpen }}
      trigger={
        <div
          onClick={() => setDropdownOpen(true)}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {org.brand_color && (
                <div
                  className="w-9 h-9 rounded-full flex-shrink-0 border border-slate-200 dark:border-slate-700"
                  style={{ backgroundColor: org.brand_color }}
                />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate">{org.name}</p>
                {org.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {org.description}
                  </p>
                )}
              </div>
            </div>

            <div onClick={e => e.stopPropagation()} className="flex-shrink-0">
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setDropdownOpen(true)}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-0 text-xs">
              {sectorLabels[org.sector] || org.sector}
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 text-xs">
              {toneLabels[org.tone] || org.tone}
            </Badge>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
              {format(new Date(org.created_at), 'd MMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>
      }
    />
  )
}