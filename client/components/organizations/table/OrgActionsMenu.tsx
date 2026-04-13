'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal, Edit2, Trash2,
  Facebook, Instagram, Twitter, MessageCircle, Linkedin, Lock, Check,
} from 'lucide-react'
import { ConnectFacebookDialog } from '@/components/organizations/ConnectFacebookDialog'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import type { Organisation } from '@/lib/api/types'

const LOCKED_CHANNELS = [
  { label: 'Instagram',   icon: Instagram,     color: 'text-pink-500'  },
  { label: 'WhatsApp',    icon: MessageCircle, color: 'text-green-500' },
  { label: 'X / Twitter', icon: Twitter,       color: 'text-slate-800' },
  { label: 'LinkedIn',    icon: Linkedin,      color: 'text-blue-700'  },
] as const

interface Props {
  org: Organisation
  onEdit: () => void
  onDelete: () => void
  controlled?: { open: boolean; onOpenChange: (v: boolean) => void }
  trigger?: React.ReactNode
}

export function OrgActionsMenu({ org, onEdit, onDelete, controlled, trigger }: Props) {
  const [fbDialogOpen, setFbDialogOpen] = useState(false)
  const { data: pages = [] } = useFacebookPages(org.id)
  const hasFacebookPage = pages.length > 0

  return (
    <>
      <DropdownMenu {...(controlled ?? {})}>
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

        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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

          {LOCKED_CHANNELS.map(({ label, icon: Icon, color }) => (
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

      <ConnectFacebookDialog open={fbDialogOpen} onOpenChange={setFbDialogOpen} orgId={org.id} />
    </>
  )
}