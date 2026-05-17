'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { LogOut, Trash2, Shield, Key } from 'lucide-react'
import { SettingsCard } from '../SettingsCard'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function AccountSection() {
  const { logout } = useAuth()
  const router = useRouter()
  const [logoutDialog, setLogoutDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Déconnexion réussie')
      router.replace('/login')
    } catch {
      toast.error('Erreur lors de la déconnexion')
    }
  }

  return (
    <div className="space-y-4">
      <SettingsCard title="Sécurité">
        <ActionRow
          icon={Shield}
          label="Sessions actives"
          description="Gérez les appareils connectés à votre compte"
          actionLabel="Voir"
          onClick={() => {}}
        />
        <ActionRow
          icon={Key}
          label="Tokens d'API"
          description="Accès programmatique à votre compte"
          actionLabel="Gérer"
          onClick={() => {}}
        />
      </SettingsCard>

      <SettingsCard title="Danger" variant="danger">
        <DangerRow
          icon={LogOut}
          label="Se déconnecter"
          description="Fermer cette session"
          actionLabel="Déconnecter"
          actionVariant="neutral"
          onClick={() => setLogoutDialog(true)}
        />
        <DangerRow
          icon={Trash2}
          label="Supprimer le compte"
          description="Suppression définitive de toutes vos données"
          actionLabel="Supprimer"
          actionVariant="danger"
          onClick={() => setDeleteDialog(true)}
        />
      </SettingsCard>

      {/* Logout dialog */}
      <AlertDialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous devrez vous reconnecter avec Google pour accéder à l'application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes vos données, organisations et publications seront supprimées définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                // TODO: DELETE /api/v1/user/me
                toast.error('Fonctionnalité à implémenter')
                setDeleteDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────────── */

import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ActionRow({
  icon: Icon, label, description, actionLabel, onClick,
}: {
  icon: LucideIcon; label: string; description: string; actionLabel: string; onClick: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onClick} className="text-xs h-7 px-3">
        {actionLabel}
      </Button>
    </div>
  )
}

function DangerRow({
  icon: Icon, label, description, actionLabel, actionVariant, onClick,
}: {
  icon: LucideIcon; label: string; description: string
  actionLabel: string; actionVariant: 'neutral' | 'danger'; onClick: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-red-100 dark:border-red-900/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
          <Icon className="w-4 h-4 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{label}</p>
          <p className="text-xs text-red-500/70 dark:text-red-500/60">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
          actionVariant === 'danger'
            ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        {actionLabel}
      </button>
    </div>
  )
}