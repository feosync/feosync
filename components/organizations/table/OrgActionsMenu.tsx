'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisH, faPencil, faTrash, faCheck, faLock } from '@fortawesome/free-solid-svg-icons'
import { faFacebook, faInstagram, faSquareXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConnectFacebookDialog } from '@/components/organizations/ConnectFacebookDialog'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import type { Organisation } from '@/lib/api/types'

// Couleurs de marque intentionnellement hors tokens
const LOCKED_CHANNELS = [
  { label: 'Instagram',   icon: faInstagram,      color: 'text-pink-500'  },
  { label: 'WhatsApp',    icon: faFacebook,        color: 'text-green-500' },
  { label: 'X / Twitter', icon: faSquareXTwitter,  color: 'text-foreground'},
  { label: 'LinkedIn',    icon: faLinkedin,        color: 'text-blue-700'  },
] as const

interface Props {
  org: Organisation
  onEdit: () => void
  onDelete: () => void
  controlled?: { open: boolean; onOpenChange: (v: boolean) => void }
  trigger?: React.ReactNode
}

export function OrgActionsMenu({ org, controlled, trigger, onDelete, onEdit }: Props) {
  const [fbDialogOpen, setFbDialogOpen] = useState(false)
  const { data: pages = [] } = useFacebookPages(org.id)
  const hasFacebookPage = pages.length > 0

  return (
    <>
      <DropdownMenu {...(controlled ?? {})}>
        <DropdownMenuTrigger asChild>
          {trigger ?? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <FontAwesomeIcon icon={faEllipsisH} className="w-4 h-4" />
            </Button>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-48 bg-card border-border"
        >
          {/* Modifier */}
          <DropdownMenuItem
            onClick={onEdit}
            className="gap-2 text-[13px] cursor-pointer text-foreground focus:bg-accent"
          >
            <FontAwesomeIcon icon={faPencil} className="w-3.5 h-3.5 text-muted-foreground" />
            Mettre à jour
          </DropdownMenuItem>

          {/* Facebook */}
          <DropdownMenuItem
            onClick={() => !hasFacebookPage && setFbDialogOpen(true)}
            disabled={hasFacebookPage}
            className="gap-2 text-[13px] cursor-pointer focus:bg-accent"
          >
            <FontAwesomeIcon icon={faFacebook} className="w-3.5 h-3.5 text-[#1877F2]" />
            {hasFacebookPage ? 'Facebook connecté' : 'Connecter Facebook'}
            {hasFacebookPage && (
              <FontAwesomeIcon icon={faCheck} className="w-3 h-3 ml-auto text-green-500" />
            )}
          </DropdownMenuItem>

          {/* Canaux verrouillés */}
          {LOCKED_CHANNELS.map(({ label, icon, color }) => (
            <DropdownMenuItem
              key={label}
              disabled
              className="gap-2 text-[13px] opacity-40"
            >
              <FontAwesomeIcon icon={icon} className={`w-3.5 h-3.5 ${color}`} />
              {label}
              <FontAwesomeIcon icon={faLock} className="w-3 h-3 ml-auto text-muted-foreground" />
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="bg-border" />

          {/* Supprimer */}
          <DropdownMenuItem
            onClick={onDelete}
            className="gap-2 text-[13px] text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          >
            <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
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