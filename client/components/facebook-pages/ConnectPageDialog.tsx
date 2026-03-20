'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Loader2, ExternalLink } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { useToast } from '@/hooks/use-toast'
import type { Organisation } from '@/lib/api/types'

interface ConnectPageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organisations: Organisation[]
}

export function ConnectPageDialog({ open, onOpenChange, organisations }: ConnectPageDialogProps) {
  const [orgId, setOrgId] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleConnect = async () => {
    if (!orgId) return
    setLoading(true)
    try {
      // 1. Récupère l'URL OAuth Meta
      const { oauth_url } = await apiClient.getFacebookOAuthUrl(orgId)

      // 2. Stocke l'orgId pour le callback
      sessionStorage.setItem('fb_oauth_org_id', orgId)

      // 3. Redirige vers Meta — toute la page change
      window.location.href = oauth_url
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            Connecter une page Facebook
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Vous serez redirigé vers Facebook pour autoriser l'accès à vos pages.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Organisation <span className="text-red-500">*</span>
            </label>
            <Select value={orgId} onValueChange={setOrgId}>
              <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Sélectionner une organisation" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900">
                {organisations.map(org => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p className="font-medium">Comment ça fonctionne :</p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-600 dark:text-blue-400">
              <li>Cliquez "Connecter avec Facebook"</li>
              <li>Autorisez FeoSync sur Facebook</li>
              <li>Choisissez la page à connecter</li>
              <li>Retour automatique sur l'application</li>
            </ol>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-200 dark:border-slate-700"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!orgId || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Redirection...</>
                : <><ExternalLink className="w-4 h-4" />Connecter avec Facebook</>
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}