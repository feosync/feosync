'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { LucideIcon, LogOut, Trash2, Shield, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsCard } from '../SettingsCard'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/* ── Section principale ──────────────────────────────────────────────────── */
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
    <div className="space-y-4 w-full">

      {/* ── Sécurité ───────────────────────────────────────────────────── */}
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

      {/* ── Zone danger ────────────────────────────────────────────────── */}
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

      {/* ── Dialog déconnexion ─────────────────────────────────────────── */}
      <AlertDialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Se déconnecter ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Vous devrez vous reconnecter avec Google pour accéder à l'application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border text-foreground hover:bg-accent"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-primary hover:bg-primary/90 text-primary-foreground
                         border-0 focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Dialog suppression ─────────────────────────────────────────── */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Supprimer votre compte ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Cette action est irréversible. Toutes vos données, organisations
              et publications seront supprimées définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border text-foreground hover:bg-accent"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                toast.error('Fonctionnalité à implémenter')
                setDeleteDialog(false)
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground
                         border-0 focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ── ActionRow ───────────────────────────────────────────────────────────── */
function ActionRow({
  icon: Icon, label, description, actionLabel, onClick,
}: {
  icon: LucideIcon; label: string; description: string
  actionLabel: string; onClick: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3
                    border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className="text-xs h-7 px-3 border-border text-foreground
                   hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        {actionLabel}
      </Button>
    </div>
  )
}

/* ── DangerRow ───────────────────────────────────────────────────────────── */
function DangerRow({
  icon: Icon, label, description, actionLabel, actionVariant, onClick,
}: {
  icon: LucideIcon; label: string; description: string
  actionLabel: string; actionVariant: 'neutral' | 'danger'; onClick: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3
                    border-b border-destructive/20 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-destructive/10
                        flex items-center justify-center">
          <Icon className="w-4 h-4 text-destructive" />
        </div>
        <div>
          <p className="text-sm font-medium text-destructive">{label}</p>
          <p className="text-xs text-destructive/60">{description}</p>
        </div>
      </div>

      <button
        onClick={onClick}
        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          actionVariant === 'danger'
            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        {actionLabel}
      </button>
    </div>
  )
}