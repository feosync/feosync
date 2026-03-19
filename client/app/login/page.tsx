'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/hooks/use-toast'

declare global {
  interface Window { google: any }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!

export default function LoginPage() {
  const router = useRouter()
  const { googleLogin, isLoading, error } = useAuth()
  const { toast } = useToast()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [gsiReady, setGsiReady] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        // ✅ Désactive FedCM — utilise le flux popup classique
        use_fedcm_for_prompt: false,
      })

      // ✅ Rend le bouton Google officiel dans le div
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          text: 'continue_with',
          size: 'large',
          locale: 'fr',
          width: buttonRef.current.offsetWidth,
        })
      }

      setGsiReady(true)
    }
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  const handleGoogleResponse = async (response: { credential: string }) => {
    try {
      await googleLogin(response.credential)
      toast({ title: 'Connexion réussie', description: 'Bienvenue sur FeoSync !' })
      router.push('/dashboard')
    } catch (err: any) {
      toast({ title: 'Erreur', description: err?.message || 'Échec de la connexion', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-8 space-y-6">

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              FS
            </div>
            <h1 className="text-2xl font-semibold mb-1">FeoSync</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Plateforme de gestion des réseaux sociaux
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-2">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            // ✅ Google rend son propre bouton ici
            <div ref={buttonRef} className="w-full flex justify-center" />
          )}

          <p className="text-center text-xs text-slate-400">
            En continuant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </Card>
    </div>
  )
}