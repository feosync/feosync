'use client'

import { useState } from 'react'
import { Trash2, ToggleLeft, ToggleRight, RefreshCw, BarChart2, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { InsightsPanel } from './InsightsPanel'
import type { FacebookPage } from '@/lib/api/types'

interface PagesListProps {
  pages: FacebookPage[]
  orgId: string
  onToggle: (pageId: string) => void
  onDelete: (pageId: string) => void
  onSyncInsights: (pageId: string) => void
  isToggling?: boolean
  isDeleting?: boolean
  isSyncing?: boolean
}

export function PagesList({
  pages, orgId, onToggle, onDelete, onSyncInsights,
  isToggling, isDeleting, isSyncing
}: PagesListProps) {
  const [pageToDelete, setPageToDelete] = useState<FacebookPage | null>(null)
  const [expandedInsights, setExpandedInsights] = useState<string | null>(null)

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900">
              <TableHead className="text-slate-600 dark:text-slate-400 font-medium">Page</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400 font-medium">ID Facebook</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400 font-medium">Statut</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400 font-medium">Dernière sync</TableHead>
              <TableHead className="text-right text-slate-600 dark:text-slate-400 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map(page => (
              <>
                <TableRow
                  key={page.id}
                  className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        f
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {page.page_name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {page.fb_page_id}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge className={
                      page.is_active
                        ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-0'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0'
                    }>
                      {page.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                    {page.last_sync_at
                      ? format(new Date(page.last_sync_at), 'd MMM yyyy HH:mm', { locale: fr })
                      : '—'
                    }
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Insights */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                        onClick={() => setExpandedInsights(expandedInsights === page.id ? null : page.id)}
                        title="Voir les insights"
                      >
                        {expandedInsights === page.id
                          ? <ChevronUp className="w-3.5 h-3.5" />
                          : <BarChart2 className="w-3.5 h-3.5" />
                        }
                      </Button>

                      {/* Sync insights */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                        onClick={() => onSyncInsights(page.id)}
                        disabled={isSyncing}
                        title="Synchroniser les insights"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      </Button>

                      {/* Toggle actif/inactif */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                        onClick={() => onToggle(page.id)}
                        disabled={isToggling}
                        title={page.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {page.is_active
                          ? <ToggleRight className="w-4 h-4 text-green-600" />
                          : <ToggleLeft className="w-4 h-4" />
                        }
                      </Button>

                      {/* Déconnecter */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => setPageToDelete(page)}
                        disabled={isDeleting}
                        title="Déconnecter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Insights panel inline */}
                {expandedInsights === page.id && (
                  <TableRow key={`insights-${page.id}`} className="bg-slate-50/50 dark:bg-slate-900/30">
                    <TableCell colSpan={5} className="p-0">
                      <InsightsPanel pageId={page.id} orgId={orgId} />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog confirmation déconnexion */}
      <AlertDialog open={!!pageToDelete} onOpenChange={open => !open && setPageToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Déconnecter la page
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Êtes-vous sûr de vouloir déconnecter{' '}
              <span className="font-medium text-slate-900 dark:text-white">
                {pageToDelete?.page_name}
              </span>{' '}
              ? Les posts planifiés sur cette page seront affectés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (pageToDelete) { onDelete(pageToDelete.id); setPageToDelete(null) } }}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}