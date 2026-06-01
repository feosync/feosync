'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useDarkMode } from '@/hooks/useDarkMode'
import Image from 'next/image'
import { config } from '@/lib/config'

/* ── Loader visuel ───────────────────────────────────────────────────────── */
function CallbackLoader() {
  const { dark } = useDarkMode()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-xs text-center">

        {/* Halo + Logo */}
        <div className="relative flex items-center justify-center">
          {/* Cercle de halo externe */}
          <div className="absolute w-32 h-32 rounded-full bg-primary/5 animate-pulse" />
          {/* Cercle intérieur */}
          <div className="absolute w-20 h-20 rounded-full bg-primary/8" />
          {/* Logo */}
          <Image
            src={dark ? '/images/dark/feosync_logo.png' : '/images/light/feosync_logo.png'}
            alt="FeoSync"
            width={240}
            height={70}
            loading="eager"
            className="relative h-10 w-auto z-10"
          />
        </div>

        {/* Texte */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground tracking-wide">
            Connexion en cours
          </p>
          <p className="text-xs text-muted-foreground">
            Vérification de vos identifiants Google…
          </p>
        </div>

        {/* Dots animés */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
            />
          ))}
        </div>

        {/* Barre de progression indéterminée */}
        <div className="w-full h-4 bg-border overflow-hidden rounded-full">
          <div
            className="h-full bg-primary rounded-full animate-[progress_1.8s_ease-in-out_infinite]"
            style={{
              animation: 'shimmer 1.8s ease-in-out infinite',
              background: `linear-gradient(90deg, transparent 0%, var(--primary) 50%, transparent 100%)`,
              transform: 'translateX(-100%)',
              animationName: 'shimmer',
            }}
          />
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}

/* ── Handler ─────────────────────────────────────────────────────────────── */
function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code  = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) { toast.error('Connexion annulée'); router.replace('/login'); return }
    if (!code)  { router.replace('/login'); return }

    handleCallback(code)
  }, [])

  const handleCallback = async (code: string) => {
    try {
      const response = await fetch(
        `${config.apiUrl}/api/v1/auth/google/callback`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            redirect_uri: `${config.appUrl}/auth/callback`,
          }),
        }
      )

      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Échec de l'authentification")

      toast.success('Connexion réussie', { description: `Bienvenue ${data.user.name} !` })
      window.location.href = '/overview'

    } catch (err: any) {
      toast.error('Erreur', { description: err.message })
      router.replace('/login')
    }
  }

  return <CallbackLoader />
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoader />}>
      <CallbackHandler />
    </Suspense>
  )
}