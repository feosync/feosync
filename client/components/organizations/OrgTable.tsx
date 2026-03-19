'use client'

import { Edit2, Trash2, Globe, Palette } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Organisation } from '@/lib/api/types'

const sectorLabels: Record<string, string> = {
  technology:    'Technologie',
  finance:       'Finance',
  healthcare:    'Santé',
  education:     'Éducation',
  retail:        'Commerce',
  manufacturing: 'Industrie',
}

const toneLabels: Record<string, string> = {
  formal:       'Formel',
  informal:     'Informel',
  friendly:     'Amical',
  professional: 'Professionnel',
  casual:       'Décontracté',
}

interface OrgTableProps {
  organisations: Organisation[]
  onEdit: (org: Organisation) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function OrgTable({ organisations, onEdit, onDelete, isDeleting }: OrgTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900">
            <TableHead className="text-slate-600 dark:text-slate-400 font-medium">Organisation</TableHead>
            <TableHead className="text-slate-600 dark:text-slate-400 font-medium">Secteur</TableHead>
            <TableHead className="text-slate-600 dark:text-slate-400 font-medium">Ton</TableHead>
            <TableHead className="text-slate-600 dark:text-slate-400 font-medium">Couleur</TableHead>
            <TableHead className="text-slate-600 dark:text-slate-400 font-medium">Créée le</TableHead>
            <TableHead className="text-right text-slate-600 dark:text-slate-400 font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organisations.map(org => (
            <TableRow
              key={org.id}
              className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
            >
              <TableCell>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{org.name}</p>
                  {org.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
                      {org.description}
                    </p>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-0 text-xs">
                  {sectorLabels[org.sector] || org.sector}
                </Badge>
              </TableCell>

              <TableCell>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {toneLabels[org.tone] || org.tone}
                </span>
              </TableCell>

              <TableCell>
                {org.brand_color ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 flex-shrink-0"
                      style={{ backgroundColor: org.brand_color }}
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {org.brand_color}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </TableCell>

              <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                {format(new Date(org.created_at), 'd MMM yyyy', { locale: fr })}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(org)}
                    className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-400 hover:text-blue-600"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(org.id)}
                    disabled={isDeleting}
                    className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950 text-slate-600 dark:text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}