'use client'

import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SettingsCard } from '../SettingsCard'
import { SettingRow } from '../SettingRow'

export function ProfileSection() {
  const { user } = useAuth()
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'

  return (
    <div className="space-y-4">
      <SettingsCard title="Profil">

        {/* ── Avatar + identité ───────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarImage src={user?.profile_picture || ''} alt={user?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-base">{user?.name}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            {user?.google_id && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <GoogleIcon />
                <span className="text-xs text-muted-foreground">Compte Google lié</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Rows ────────────────────────────────────────────────────── */}
        <SettingRow label="Nom affiché" description="Visible dans l'application">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 px-3 border-border text-foreground
                       hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Modifier
          </Button>
        </SettingRow>

        <SettingRow label="Adresse email" description={user?.email || '—'}>
          <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md">
            Gérée par Google
          </span>
        </SettingRow>

      </SettingsCard>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}