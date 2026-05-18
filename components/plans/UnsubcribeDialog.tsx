import { LogOut, X, Sparkles, TrendingUp, Clock, Users } from "lucide-react";
import { Plan } from "@/lib/api/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FEATURE_ICONS = [Users, TrendingUp, Clock, Sparkles, Sparkles];

export function UnsubscribeConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  currentPlan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  currentPlan: Plan | null;
}) {
  const lostFeatures = currentPlan?.features?.slice(0, 4) ?? [
    "Collaboration en équipe",
    "Planification de publication",
    "Réponse commentée automatique",
    "Alertes intelligentes",
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="
        p-0 gap-0 overflow-hidden
        max-w-105 w-[calc(100%-2rem)]
        bg-background border border-border/60
        rounded-2xl shadow-2xl
      ">

        {/* ── Hero banner ── */}
        <div className="relative px-6 pt-8 pb-6 bg-linear-to-b from-destructive/8 to-transparent">

          {/* Top-right subtle close hint */}
          <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </div>

          {/* Icon badge */}
          <div className="
            mx-auto mb-5 w-14 h-14
            rounded-2xl border border-destructive/25 bg-destructive/10
            flex items-center justify-center
            shadow-[0_0_0_6px_hsl(var(--destructive)/.06)]
          ">
            <LogOut className="w-6 h-6 text-destructive" strokeWidth={1.75} />
          </div>

          <AlertDialogHeader className="text-center space-y-2 p-0">
            <AlertDialogTitle className="text-[17px] font-semibold leading-snug tracking-tight text-center">
              Vous êtes sûr de vouloir partir ?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <p className="text-[13px] text-muted-foreground leading-relaxed max-w-full mx-auto text-center">
                Votre audience, vos contenus et vos réseaux resteront en attente.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-border/50 mx-6" />

        {/* ── Lost features list ── */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-destructive/80">
            Ce que vous perdez
          </p>
          <ul className="space-y-2">
            {lostFeatures.map((feature, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl bg-destructive/5 border border-destructive/10"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-destructive/12 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-destructive/80" strokeWidth={1.75} />
                  </span>
                  <span className="text-[13px] font-medium text-foreground/85">{feature}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Retention nudge ── */}
        <div className="mx-6 mb-5 px-4 py-3 rounded-xl bg-muted/50 border border-border/50">
          <p className="text-[12px] text-muted-foreground leading-relaxed text-center">
            Avant de partir,{" "}
            <span className="font-medium text-foreground/70">dites-nous ce qui manque</span>
            {" "}— votre retour aide à améliorer la plateforme.
          </p>
        </div>

        {/* ── Footer ── */}
        <AlertDialogFooter className="flex-row gap-2.5 px-6 pb-6 pt-0">
          <AlertDialogCancel className="
            flex-1 h-10 rounded-xl text-[13px] font-medium
            border border-border/70 bg-background
            hover:bg-muted/60 transition-colors
          ">
            Garder mon abonnement
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="
              flex-1 h-10 rounded-xl text-[13px] font-medium
              bg-destructive/90 hover:bg-destructive
              text-destructive-foreground
              transition-colors disabled:opacity-60
            "
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                En cours…
              </span>
            ) : (
              "Se désabonner"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  );
}