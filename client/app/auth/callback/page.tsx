'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUserFromToken } = useAuth()  // ← plus googleLogin
  const { toast } = useToast()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      toast({ title: 'Connexion annulée', variant: 'destructive' })
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google/callback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          }),
        }
      )

      if (!response.ok) throw new Error('Échec de l\'authentification')

      const data = await response.json()
      
      await setUserFromToken(data.access_token)

      toast({ title: 'Connexion réussie', description: `Bienvenue ${data.user.name} !` })
      router.replace('/dashboard')

    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
      router.replace('/login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
        FS
      </div>
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      <p className="text-sm text-slate-500">Connexion en cours...</p>
    </div>
  )
}