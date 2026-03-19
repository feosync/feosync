'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MetaPageItem } from '@/lib/api/types'

export default function FacebookCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [pages, setPages] = useState<MetaPageItem[]>([])
  const [orgId, setOrgId] = useState('')
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    const code  = searchParams.get('code')
    const state = searchParams.get('state')   // org_id
    const error = searchParams.get('error')

    if (error || !code || !state) {
      toast({ title: 'Connexion annulée', variant: 'destructive' })
      router.replace('/pages')
      return
    }

    exchangeCode(code, state)
  }, [])

  const exchangeCode = async (code: string, state: string) => {
    try {
      // Appelle GET /api/v1/fb/oauth/callback?code=xxx&state=org_id
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/fb/oauth/callback?code=${code}&state=${state}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('feosync_token')}`,
          },
        }
      )
      if (!response.ok) throw new Error('Échec de l\'échange du code')

      const data = await response.json()
      // { org_id, available_pages: [{ id, name, access_token }] }
      console.log('Pages récupérées de Meta:', data)
      setPages(data.available_pages || [])
      setOrgId(data.org_id || state)
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
      router.replace('/pages')
    } finally {
      setLoading(false)
    }
  }

  const connectPage = async (page: MetaPageItem) => {
    setConnecting(page.id)
    try {
      await apiClient.connectFacebookPage({
        fb_page_id:   page.id,
        page_name:    page.name,
        access_token: page.access_token,
        org_id:       orgId,
      })
      toast({ title: 'Page connectée !', description: page.name })
      router.replace('/pages')
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    } finally {
      setConnecting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
          FS
        </div>
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500">Récupération de vos pages Facebook...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">

        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-3">
            FS
          </div>
          <h1 className="text-[18px] font-medium text-slate-900 dark:text-white">
            Choisissez une page
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sélectionnez la page à connecter à votre organisation
          </p>
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500 mb-4">Aucune page disponible sur ce compte.</p>
            <Button variant="outline" onClick={() => router.replace('/pages')}>
              Retour
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {pages.map(page => (
              <button
                key={page.id}
                onClick={() => connectPage(page)}
                disabled={!!connecting}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors disabled:opacity-60 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    f
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {page.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {page.id}
                    </p>
                  </div>
                </div>
                {connecting === page.id
                  ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  : <Check className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                }
              </button>
            ))}

            <Button
              variant="ghost"
              className="w-full mt-1 text-slate-500"
              onClick={() => router.replace('/pages')}
              disabled={!!connecting}
            >
              Annuler
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
