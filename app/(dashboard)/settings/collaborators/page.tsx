"use client"

import { useState } from "react"
import { Users, UserPlus, X, Building2, Clock, Mail, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  useCollaborators, useInviteCollaborator,
  useRevokeCollaborator, useAssignOrganizations,
  useInvitations, useCancelInvitation,
} from "@/hooks/useCollaborators"
import { useMyRole } from "@/hooks/useMyRole"
import { useOrganisations } from "@/hooks/useOrganisations"
import { InviteDialog } from "@/components/collaborators/InviteDialog"
import { AssignOrgsDialog } from "@/components/collaborators/AssignOrgsDialog"
import { useAuth } from "@/hooks/useAuth"
import type { Collaborator, Invitation } from "@/lib/api/types"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-success/10 text-success border-success/20" },
  pending: { label: "En attente", className: "bg-warning/10 text-warning border-warning/20" },
  revoked: { label: "Révoqué", className: "bg-destructive/10 text-destructive border-destructive/20" },
}

export default function CollaboratorsPage() {
  const { user } = useAuth()
  const { data: roleData, isLoading: roleLoading } = useMyRole()
  const { data: collabData, isLoading } = useCollaborators()
  const { data: invData, isLoading: invLoading } = useInvitations()
  const { data: orgData } = useOrganisations({ page: 1, page_size: 50 })
  const inviteMutation = useInviteCollaborator()
  const revokeMutation = useRevokeCollaborator()
  const assignMutation = useAssignOrganizations()
  const cancelInvMutation = useCancelInvitation()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<Collaborator | null>(null)
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null)
  const [confirmCancelInvite, setConfirmCancelInvite] = useState<string | null>(null)

  const collaborators = collabData?.items ?? []
  const invitations = invData?.items ?? []
  const allOrganizations = orgData?.items ?? []

  const handleInvite = async (email: string) => {
    await inviteMutation.mutateAsync(email)
    setInviteOpen(false)
  }

  const handleAssign = async (orgIds: string[]) => {
    if (!assignTarget) return
    await assignMutation.mutateAsync({
      collaboratorId: assignTarget.id,
      organizationIds: orgIds,
    })
    setAssignTarget(null)
  }

  const handleRevoke = async () => {
    if (!confirmRevoke) return
    await revokeMutation.mutateAsync(confirmRevoke)
    setConfirmRevoke(null)
  }

  if (!user) return null

  if (!roleLoading && roleData?.role === "collaborator") {
    return (
      <div className="min-h-full bg-background transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
              <ShieldAlert className="w-7 h-7 text-destructive" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Accès restreint</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Vous êtes collaborateur sur ce compte. Seul le propriétaire peut gérer les collaborateurs.
            </p>
            {roleData?.owner_name && (
              <p className="text-xs text-muted-foreground">
                Propriétaire : {roleData.owner_name}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-background transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="mb-6 pb-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Collaborateurs</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gérez les personnes qui ont accès à vos organisations
              </p>
            </div>
            <Button
              onClick={() => setInviteOpen(true)}
              className="rounded-xl gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Inviter
            </Button>
          </div>
        </div>

        {/* ── Liste ── */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : collaborators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              Aucun collaborateur
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Invitez des collaborateurs à accéder à vos organisations.
            </p>
            <Button
              variant="outline"
              onClick={() => setInviteOpen(true)}
              className="rounded-xl gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Inviter un collaborateur
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {collaborators.map((collab) => {
              const statusCfg = STATUS_CONFIG[collab.status] ?? STATUS_CONFIG.active
              return (
                <div
                  key={collab.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {(collab.name ?? collab.email)[0].toUpperCase()}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {collab.name ?? collab.email}
                      </span>
                      {collab.name && (
                        <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                          ({collab.email})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-[11px] px-2 py-0 ${statusCfg.className}`}>
                        {statusCfg.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {collab.assigned_organizations.length} collaboration(s)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAssignTarget(collab)}
                      className="rounded-lg gap-1.5 text-xs"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Org</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmRevoke(collab.id)}
                      className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Retirer</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Invitations en attente ── */}
        {!invLoading && invitations.filter((inv) => inv.status === "pending").length > 0 && (
          <div className="mt-8 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Invitations en attente
            </h2>
            <div className="space-y-3">
              {invitations.filter((inv) => inv.status === "pending").map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-warning" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {inv.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[11px] px-2 py-0 bg-warning/10 text-warning border-warning/20">
                        En attente
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Expire le {new Date(inv.expires_at).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmCancelInvite(inv.id)}
                      className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Annuler</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
        isPending={inviteMutation.isPending}
      />

      <AssignOrgsDialog
        open={!!assignTarget}
        onOpenChange={(v) => { if (!v) setAssignTarget(null) }}
        collaborator={assignTarget}
        allOrganizations={allOrganizations}
        onAssign={handleAssign}
        isPending={assignMutation.isPending}
      />

      {/* Confirm revoke dialog */}
      <div
        data-state={confirmRevoke ? "open" : "closed"}
        className={`fixed inset-0 z-50 flex items-center justify-center ${confirmRevoke ? "" : "hidden"}`}
      >
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setConfirmRevoke(null)} />
        <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-[calc(100%-2rem)] p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Révoquer l&apos;accès</h3>
          <p className="text-sm text-muted-foreground">
            Ce collaborateur perdra l&apos;accès à toutes ses collaborations.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setConfirmRevoke(null)} className="rounded-xl">
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              loading={revokeMutation.isPending}
              className="rounded-xl"
            >
              Révoquer
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm cancel invitation dialog */}
      <div
        data-state={confirmCancelInvite ? "open" : "closed"}
        className={`fixed inset-0 z-50 flex items-center justify-center ${confirmCancelInvite ? "" : "hidden"}`}
      >
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setConfirmCancelInvite(null)} />
        <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-[calc(100%-2rem)] p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Annuler l&apos;invitation</h3>
          <p className="text-sm text-muted-foreground">
            Cette invitation sera supprimée et le collaborateur ne pourra plus l&apos;utiliser.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setConfirmCancelInvite(null)} className="rounded-xl">
              Retour
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!confirmCancelInvite) return
                await cancelInvMutation.mutateAsync(confirmCancelInvite)
                setConfirmCancelInvite(null)
              }}
              loading={cancelInvMutation.isPending}
              className="rounded-xl"
            >
              Annuler l&apos;invitation
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
