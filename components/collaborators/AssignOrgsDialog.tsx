"use client"

import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Collaborator, Organisation } from "@/lib/api/types"

interface AssignOrgsDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  collaborator: Collaborator | null
  allOrganizations: Organisation[]
  onAssign: (organizationIds: string[]) => Promise<void>
  isPending: boolean
}

export function AssignOrgsDialog({
  open, onOpenChange, collaborator,
  allOrganizations, onAssign, isPending,
}: AssignOrgsDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open && collaborator) {
      setSelectedIds(new Set(collaborator.assigned_organizations.map((o) => o.id)))
    }
  }, [open, collaborator])

  const toggleOrg = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSave = () => {
    onAssign(Array.from(selectedIds))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            Assigner des organisations
          </DialogTitle>
          <DialogDescription className="text-center">
            {collaborator?.name ?? collaborator?.email} verra uniquement les organisations sélectionnées.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allOrganizations.map((org) => {
            const isSelected = selectedIds.has(org.id)
            return (
              <button
                key={org.id}
                type="button"
                onClick={() => toggleOrg(org.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                  "border text-sm",
                  isSelected
                    ? "border-primary/40 bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-border/80",
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                  isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30",
                )}>
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
                {org.name}
              </button>
            )
          })}
        </div>

        <DialogFooter className="sm:justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            loading={isPending}
            className="rounded-xl"
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
