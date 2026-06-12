"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, UserPlus } from "lucide-react"

interface InviteDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onInvite: (email: string) => Promise<void>
  isPending: boolean
}

export function InviteDialog({ open, onOpenChange, onInvite, isPending }: InviteDialogProps) {
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    await onInvite(email.trim())
    setEmail("")
  }

  const handleOpenChange = (v: boolean) => {
    if (!v) setEmail("")
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Inviter un collaborateur</DialogTitle>
          <DialogDescription className="text-center">
            Entrez l&apos;email de l&apos;utilisateur à ajouter comme collaborateur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 h-11 rounded-xl"
              required
            />
          </div>

          <DialogFooter className="sm:justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="rounded-xl"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={isPending}
              className="rounded-xl"
            >
              Inviter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
