'use client'

import { useState, useRef } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MoreHorizontal, Edit2, Trash2,
  Facebook, Instagram, Twitter, MessageCircle, Linkedin, Lock, Check,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { OrgDetailSheet } from '@/components/organizations/OrgDetailSheet'
import { ConnectFacebookDialog } from '@/components/organizations/ConnectFacebookDialog'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import type { Organisation } from '@/lib/api/types'

const sectorLabels: Record<string, string> = {
  technology: 'Technologie', finance: 'Finance',
  healthcare: 'Santé', education: 'Éducation',
  retail: 'Commerce', manufacturing: 'Industrie',
}

const toneLabels: Record<string, string> = {
  formal: 'Formel', informal: 'Informel', friendly: 'Amical',
  professional: 'Professionnel', casual: 'Décontracté',
}

interface OrgTableProps {
  organisations: Organisation[]
  onEdit: (org: Organisation) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function OrgTable({ organisations, onEdit, onDelete, isDeleting }: OrgTableProps) {
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null)
  const [orgToDelete, setOrgToDelete] = useState<Organisation | null>(null)

  return (
    <>
      {/* ── Desktop : table ─────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
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
                onClick={() => setSelectedOrg(org)}
                className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    {org.brand_color && (
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: org.brand_color }} />
                    )}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{org.name}</p>
                      {org.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
                          {org.description}
                        </p>
                      )}
                    </div>
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
                        className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700"
                        style={{ backgroundColor: org.brand_color }}
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{org.brand_color}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                  {format(new Date(org.created_at), 'd MMM yyyy', { locale: fr })}
                </TableCell>
                <TableCell className="text-right">
                  <div onClick={e => e.stopPropagation()}>
                    <OrgActionsMenu
                      org={org}
                      onEdit={() => onEdit(org)}
                      onDelete={() => setOrgToDelete(org)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Mobile : cards ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3 md:hidden">
        {organisations.map(org => (
          <OrgCard
            key={org.id}
            org={org}
            onView={() => setSelectedOrg(org)}
            onEdit={() => onEdit(org)}
            onDelete={() => setOrgToDelete(org)}
          />
        ))}
      </div>

      {/* Sheet détail */}
      <OrgDetailSheet org={selectedOrg} onClose={() => setSelectedOrg(null)} />

      {/* Confirm delete */}
      <AlertDialog open={!!orgToDelete} onOpenChange={open => !open && setOrgToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Supprimer l'organisation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className="font-medium text-slate-900 dark:text-white">{orgToDelete?.name}</span>{' '}
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (orgToDelete) { onDelete(orgToDelete.id); setOrgToDelete(null) } }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ── OrgCard (mobile) ──────────────────────────────────────────────────────────

function OrgCard({ org, onView, onEdit, onDelete }: {
  org: Organisation
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleCardClick = () => {
    // Ouvre le dropdown au lieu du sheet sur mobile
    setDropdownOpen(true)
  }

  return (
    <OrgActionsMenu
      org={org}
      onEdit={onEdit}
      onDelete={onDelete}
      // On expose le contrôle du dropdown pour le card click
      controlled={{ open: dropdownOpen, onOpenChange: setDropdownOpen }}
      trigger={
        <div
          onClick={handleCardClick}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            {/* Infos principales */}
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

            {/* Bouton actions — stopPropagation pour ne pas re-déclencher handleCardClick */}
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

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-0 text-xs">
              {sectorLabels[org.sector] || org.sector}
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 text-xs">
              {toneLabels[org.tone] || org.tone}
            </Badge>
            <span className="text-xs text-slate-400 dark:text-slate-500 self-center ml-auto">
              {format(new Date(org.created_at), 'd MMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>
      }
    />
  )
}

// ── OrgActionsMenu ────────────────────────────────────────────────────────────

function OrgActionsMenu({ org, onEdit, onDelete, controlled, trigger }: {
  org: Organisation
  onEdit: () => void
  onDelete: () => void
  /** Rend le DropdownMenu contrôlé (pour l'ouverture via card click) */
  controlled?: { open: boolean; onOpenChange: (v: boolean) => void }
  /** Remplace le trigger par défaut (bouton ⋯) par un élément custom */
  trigger?: React.ReactNode
}) {
  const [fbDialogOpen, setFbDialogOpen] = useState(false)
  const { data: pages = [] } = useFacebookPages(org.id)
  const hasFacebookPage = pages.length > 0

  const dropdownProps = controlled
    ? { open: controlled.open, onOpenChange: controlled.onOpenChange }
    : {}

  return (
    <>
      <DropdownMenu {...dropdownProps}>
        <DropdownMenuTrigger asChild>
          {trigger ?? (
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <DropdownMenuItem onClick={onEdit} className="gap-2 text-[13px] cursor-pointer">
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            Mettre à jour
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => !hasFacebookPage && setFbDialogOpen(true)}
            disabled={hasFacebookPage}
            className="gap-2 text-[13px] cursor-pointer"
          >
            <Facebook className="w-3.5 h-3.5 text-blue-600" />
            {hasFacebookPage ? 'Facebook connecté' : 'Connecter Facebook'}
            {hasFacebookPage && <Check className="w-3 h-3 ml-auto text-green-500" />}
          </DropdownMenuItem>

          {[
            { label: 'Instagram',   icon: Instagram,      color: 'text-pink-500'  },
            { label: 'WhatsApp',    icon: MessageCircle,  color: 'text-green-500' },
            { label: 'X / Twitter', icon: Twitter,        color: 'text-slate-800' },
            { label: 'LinkedIn',    icon: Linkedin,       color: 'text-blue-700'  },
          ].map(({ label, icon: Icon, color }) => (
            <DropdownMenuItem key={label} disabled className="gap-2 text-[13px] opacity-40">
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              {label}
              <Lock className="w-3 h-3 ml-auto text-slate-400" />
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

          <DropdownMenuItem
            onClick={onDelete}
            className="gap-2 text-[13px] text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConnectFacebookDialog
        open={fbDialogOpen}
        onOpenChange={setFbDialogOpen}
        orgId={org.id}
      />
    </>
  )
}