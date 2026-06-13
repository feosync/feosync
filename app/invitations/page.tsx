"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { apiClient } from "@/lib/api/client"
import { Users, Check, X, Loader2, AlertCircle, Clock } from "lucide-react"

type InvitationState = "loading" | "expired" | "accepted" | "declined" | "error" | "ready"

export default function InvitationsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [state, setState] = useState<InvitationState>("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!token) {
      setState("error")
      setMessage("Aucun token d'invitation trouvé dans l'URL")
      return
    }
    setState("ready")
  }, [token, authLoading])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    sessionStorage.setItem("returnUrl", window.location.href)
    router.push("/login")
    return null
  }

  if (state === "error") {
    return <ResultState icon={AlertCircle} title="Lien invalide" message={message} iconClass="text-destructive" />
  }

  if (state === "expired") {
    return <ResultState icon={Clock} title="Invitation expirée" message={message || "Cette invitation n'est plus valide."} iconClass="text-muted-foreground" />
  }

  if (state === "accepted") {
    return (
      <ResultState
        icon={Check}
        title="Invitation acceptée !"
        message={message || "Vous êtes maintenant collaborateur sur ce compte."}
        iconClass="text-emerald-500"
        action={{ label: "Accéder au tableau de bord", href: "/" }}
      />
    )
  }

  if (state === "declined") {
    return (
      <ResultState
        icon={X}
        title="Invitation refusée"
        message={message || "Vous avez refusé l'invitation."}
        iconClass="text-muted-foreground"
      />
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-7 h-7 text-primary" />
        </div>

        <h1 className="text-xl font-semibold text-foreground mb-2">
          Invitation à collaborer
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Vous avez été invité à rejoindre un compte FeoSync en tant que collaborateur.
        </p>

        <InvitationActions token={token!} onStateChange={(s, m) => { setState(s); setMessage(m || "") }} />
      </div>
    </div>
  )
}

function InvitationActions({
  token,
  onStateChange,
}: {
  token: string
  onStateChange: (state: InvitationState, message?: string) => void
}) {
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    setLoading(true)
    try {
      const res = await apiClient.acceptInvitation(token)
      onStateChange("accepted", res.message)
    } catch (err: any) {
      const msg = err?.message || "Erreur lors de l'acceptation"
      if (msg.toLowerCase().includes("expir")) {
        onStateChange("expired", msg)
      } else {
        onStateChange("error", msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    setLoading(true)
    try {
      const res = await apiClient.declineInvitation(token)
      onStateChange("declined", res.message)
    } catch (err: any) {
      onStateChange("error", err?.message || "Erreur lors du refus")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Accepter l'invitation
      </button>
      <button
        onClick={handleDecline}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card text-foreground px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
      >
        <X className="w-4 h-4" />
        Refuser
      </button>
    </div>
  )
}

function ResultState({
  icon: Icon,
  title,
  message,
  iconClass,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  message: string
  iconClass: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center">
        <Icon className={`w-12 h-12 mx-auto mb-4 ${iconClass}`} />
        <h1 className="text-lg font-semibold text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        {action && (
          <a
            href={action.href}
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {action.label}
          </a>
        )}
      </div>
    </div>
  )
}
