'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import Image from 'next/image'
import { config } from '@/lib/config'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUserFromToken } = useAuth()

  useEffect(() => {
    const code  = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      toast.error('Connexion annulée')
      router.replace('/login')
      return
    }

    if (!code) {
      router.replace('/login')
      return
    }

    handleCallback(code)
  }, [])

  const handleCallback = async (code: string) => {
    try {
      const response = await fetch(
        `${config.apiUrl}/api/v1/auth/google/callback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            redirect_uri: `${config.appUrl}/auth/callback`,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) throw new Error(data.detail || "Échec de l'authentification")

      await setUserFromToken(data.access_token)
      toast.success('Connexion réussie', { description: `Bienvenue ${data.user.name} !` })
      window.location.href = '/overview'   // ← force reload du contexte auth

    } catch (err: any) {
      toast.error('Erreur', { description: err.message })
      router.replace('/login')
    }
  }

  return <CallbackLoader />  // ← plus de null, loader pendant tout le traitement
}

function CallbackLoader() {
  const { dark } = useDarkMode()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Image
        src={dark ? '/images/dark/feosync_logo.png' : '/images/light/feosync_logo.png'}
        alt="FeoSync"
        width={240}
        height={70}
        loading="eager"
        className="h-16 w-auto"
      />
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      <p className="text-sm text-slate-500">Connexion en cours...</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  // ← plus de <CallbackLoader /> en double
  return (
    <Suspense fallback={<CallbackLoader />}>
      <CallbackHandler />
    </Suspense>
  )
}