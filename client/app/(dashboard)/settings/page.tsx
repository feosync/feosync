'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { LogOut, Moon, Sun, Bell, Mail, Trash2, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

function SettingRow({ label, description, children }: {
  label: string; description?: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div>
        <p className="text-[14px] font-medium text-slate-900 dark:text-white">{label}</p>
        {description && <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [logoutDialog, setLogoutDialog]   = useState(false)
  const [deleteDialog, setDeleteDialog]   = useState(false)
  const [emailNotifs,  setEmailNotifs]    = useState(true)
  const [pushNotifs,   setPushNotifs]     = useState(false)

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

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
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">Paramètres</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Gérez votre compte et vos préférences
        </p>
      </div>

      {/* Profil */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <h2 className="text-[13px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Profil
        </h2>
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user?.profile_picture || ''} alt={user?.name} />
            <AvatarFallback className="bg-blue-600 text-white font-medium">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            {user?.google_id && (
              <div className="flex items-center gap-1 mt-1">
                <svg width="12" height="12" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span className="text-[11px] text-slate-400">Connecté via Google</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apparence */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <h2 className="text-[13px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Apparence
        </h2>
        <SettingRow
          label="Mode sombre"
          description="Basculer entre thème clair et sombre"
        >
          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-slate-400" />
            <Toggle
              checked={theme === 'dark'}
              onChange={v => setTheme(v ? 'dark' : 'light')}
            />
            <Moon className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </SettingRow>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <h2 className="text-[13px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Notifications
        </h2>
        <SettingRow label="Notifications email" description="Recevoir les alertes par email">
          <Toggle checked={emailNotifs} onChange={setEmailNotifs} />
        </SettingRow>
        <SettingRow label="Notifications push" description="Alertes dans l'application">
          <Toggle checked={pushNotifs} onChange={setPushNotifs} />
        </SettingRow>
      </div>

      {/* Compte */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <h2 className="text-[13px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Compte
        </h2>
        <div className="space-y-2">
          <button
            onClick={() => setLogoutDialog(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-slate-400" />
              <span className="text-[14px] text-slate-700 dark:text-slate-300">Se déconnecter</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
          <button
            onClick={() => setDeleteDialog(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="text-[14px] text-red-600 dark:text-red-400">Supprimer le compte</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-300" />
          </button>
        </div>
      </div>

      {/* À propos */}
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 p-4">
        <h2 className="text-[13px] font-medium text-blue-800 dark:text-blue-200 mb-2">À propos de FeoSync</h2>
        <div className="space-y-1 text-[12px] text-blue-700 dark:text-blue-300">
          <p>FeoSync v1.0.0</p>
          <p>Next.js 14 · FastAPI · PostgreSQL · Meta Graph API</p>
        </div>
      </div>

      {/* Dialog déconnexion */}
      <AlertDialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">Se déconnecter ?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Vous devrez vous reconnecter avec Google pour accéder à l'application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog suppression compte */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Supprimer votre compte ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Cette action est irréversible. Toutes vos données, organisations et publications seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                // TODO: appeler DELETE /api/v1/user/me
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