import { Plan } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

import { PlanAction } from "./PlanCard";
import { ArrowDown, ArrowUp, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PendingChange {
  plan: Plan;
  action: PlanAction;
}

const actionConfig = {
  UPGRADE: {
    icon: ArrowUp,
    iconColor: "text-primary",
    bgColor: "bg-primary/10 border border-primary/20",
    title: "Passer à un niveau supérieur",
    confirmText: "Confirmer l'upgrade",
    confirmClass: "bg-primary hover:bg-primary/90",
  },
  DOWNGRADE: {
    icon: ArrowDown,
    iconColor: "text-destructive",
    bgColor: "bg-destructive/10 border border-destructive/20",
    title: "Confirmer le changement",
    confirmText: "Confirmer le downgrade",
    confirmClass: "bg-destructive hover:bg-destructive/90",
  },
  CREATE: {
    icon: CreditCard,
    iconColor: "text-foreground",
    bgColor: "bg-muted border border-border",
    title: "Souscrire au plan",
    confirmText: "Souscrire maintenant",
    confirmClass: "bg-primary hover:bg-primary/90",
  },
} as const;

export function UpDowngradeCreateDialogue({
  open,
  onOpenChange,
  onClick,
  isPending,
  currentPlan,
}: {
  open: PendingChange | null;
  onOpenChange: (open: boolean) => void;
  onClick: () => void;
  isPending: boolean
  currentPlan: Plan | null;
}) {
  if (!open) return null;
  if (open.action === "CURRENT") return null;

  const config = actionConfig[open.action as keyof typeof actionConfig];
  const Icon = config.icon;

  return (
    <AlertDialog open={!!open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          "bg-background border border-border/60 backdrop-blur-2xl",
          "max-w-md w-[calc(100%-2rem)] rounded-3xl",
          "shadow-2xl shadow-black/10 dark:shadow-black/50"
        )}
      >
        <AlertDialogHeader className="space-y-6 pt-2">
          {/* Icon Circle */}
          <div className="flex justify-center">
            <div
              className={cn(
                "w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-300",
                config.bgColor
              )}
            >
              <Icon className={cn("w-10 h-10", config.iconColor)} />
            </div>
          </div>

          {/* Title */}
          <AlertDialogTitle className="text-center text-2xl font-semibold tracking-tight">
            {open.action === "CREATE"
              ? `${config.title} ${open.plan.name}`
              : config.title}
          </AlertDialogTitle>

          {/* Description améliorée avec Cialdini */}
          <AlertDialogDescription asChild>
            <div className="text-center text-muted-foreground text-[15px] leading-relaxed px-2">
              {open.action === "UPGRADE" && (
                <p>
                  Vous êtes sur le point de rejoindre les utilisateurs les plus performants en passant au plan{" "}
                  <strong className="text-foreground">{open.plan.name}</strong>.
                  <br /><br />
                  Des milliers d’utilisateurs ont déjà franchi cette étape et constatent une nette amélioration de leur expérience.
                </p>
              )}

              {open.action === "DOWNGRADE" && (
                <p>
                  Vous allez passer du plan{" "}
                  <strong className="text-foreground">{currentPlan?.name}</strong> au plan{" "}
                  <strong className="text-foreground">{open.plan.name}</strong>.
                  <br /><br />
                  Cette modification prendra effet immédiatement. Vous pourrez revenir à tout moment à votre ancien plan.
                </p>
              )}

              {open.action === "CREATE" && (
                <p>
                  En souscrivant au plan <strong className="text-foreground">{open.plan.name}</strong>, 
                  vous accédez immédiatement à toutes les fonctionnalités premium utilisées par nos utilisateurs les plus avancés.
                  <br /><br />
                  Rejoignez une communauté d’utilisateurs qui ont fait le choix d’aller plus loin.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-3 mt-8 sm:gap-4">
          <AlertDialogCancel
            className="flex-1 h-10 rounded-2xl text-[14px] font-medium border border-border/70 hover:bg-muted/70 transition-colors"
          >
            Garder mon abonnement actuel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onClick}
            disabled={isPending}
            className={cn(
              "rounded-2xl h-10 text-base text-foreground font-medium flex-1 transition-all active:scale-[0.985]",
              config.confirmClass
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2.5 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              config.confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}