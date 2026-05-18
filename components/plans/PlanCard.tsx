"use client";

import { Button } from "@/components/ui/button";
import { Check, Loader2, ArrowUp, ArrowDown, Lock, Sparkles, Zap } from "lucide-react";
import type { Plan } from "@/lib/api/types";

export type PlanAction = "CREATE" | "UPGRADE" | "DOWNGRADE" | "CURRENT" | "UNAVAILABLE";

export function getPlanAction(
  plan: Plan,
  currentPlanId: number | null,
  planIndex: number,
  currentPlanIndex: number
): PlanAction {
  if (!plan.is_active) return "UNAVAILABLE";
  if (plan.id === currentPlanId) return "CURRENT";
  if (!currentPlanId) return "CREATE";
  return planIndex > currentPlanIndex ? "UPGRADE" : "DOWNGRADE";
}

interface PlanCardProps {
  plan: Plan & { description?: string };
  index: number;
  currentPlanId: number | null;
  currentPlanIndex: number;
  onSubscribe: (plan: Plan, action: PlanAction) => void;
  isLoading: boolean;
}

export function PlanCard({
  plan,
  index,
  currentPlanId,
  currentPlanIndex,
  onSubscribe,
  isLoading,
}: PlanCardProps) {
  const action = getPlanAction(plan, currentPlanId, index, currentPlanIndex);
  const isCurrent = action === "CURRENT";
  const isPopular = index === 1;
  const hasNoPlan = currentPlanId === null;

  // Configuration des boutons selon le contexte
  const getButtonConfig = () => {
    if (action === "CURRENT") {
      return {
        label: "Plan actuel",
        icon: <Check className="w-4 h-4 mr-2" />,
        className: "bg-muted text-muted-foreground cursor-default",
      };
    }

    if (action === "UNAVAILABLE") {
      return {
        label: "Indisponible",
        icon: <Lock className="w-4 h-4 mr-2" />,
        className: "opacity-50 cursor-not-allowed",
      };
    }

    // === Cas spécial : Utilisateur sans aucun plan ===
    if (hasNoPlan) {
      if (index === 0) {
        return {
          label: plan.price === 0 ? "Commencer gratuitement" : `Choisir Starter`,
          icon: null,
          className: "bg-secondary hover:bg-secondary/80 text-foreground border border-border font-medium",
        };
      }
      if (index === 1) {
        return {
          label: "Choisir le plus populaire",
          icon: <Sparkles className="w-4 h-4 mr-2" />,
          className: "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
        };
      }
      if (index === 2) {
        return {
          label: "Passer au plan Pro",
          icon: <Zap className="w-4 h-4 mr-2" />,
          className: "bg-green-500 text-primary-foreground hover:brightness-105 font-semibold",
        };
      }
    }

    // === Cas normal (upgrade / downgrade) ===
    if (action === "UPGRADE") {
      return {
        label: `Upgrader vers ${plan.name}`,
        icon: <ArrowUp className="w-4 h-4 mr-2" />,
        className: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 font-semibold",
      };
    }
    if (action === "DOWNGRADE") {
      return {
        label: `Passer à ${plan.name}`,
        icon: <ArrowDown className="w-4 h-4 mr-2" />,
        className: "bg-secondary hover:bg-secondary/80",
      };
    }

    // Fallback CREATE
    return {
      label: `Choisir ${plan.name}`,
      icon: null,
      className: "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
    };
  };

  const btn = getButtonConfig();

  return (
    <div
      className={`
        group relative flex flex-col rounded-3xl p-7 sm:p-8 
        bg-card border transition-all duration-300
        ${isCurrent 
          ? "border-primary/60 shadow-xl shadow-primary/10 ring-1 ring-primary/20" 
          : "border-border hover:border-border/80"}
        ${isPopular ? "scale-[1.03] md:scale-[1.05] border-primary/30" : ""}
      `}
      role="article"
      aria-label={`Plan ${plan.name}`}
    >
      {/* Popular Badge */}
      {isPopular && !isCurrent && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-4 py-1 rounded-full shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            Le plus populaire
          </div>
        </div>
      )}

      {/* Accent bar */}
      {isCurrent && (
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
      )}

      {/* Name & Description */}
      <div className="mb-6">
        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
          {plan.name}
        </h3>
        {plan.description && (
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        )}
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl sm:text-6xl font-bold tracking-tighter text-foreground">
            {plan.price === 0 ? "0" : plan.price.toLocaleString("fr-MG")}
          </span>
          <span className="text-muted-foreground text-lg">Ar</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">par mois</p>
      </div>

      {/* Button */}
      <Button
        onClick={() => onSubscribe(plan, action)}
        disabled={action === "CURRENT" || action === "UNAVAILABLE" || isLoading}
        className={`w-full h-14 rounded-2xl text-base font-semibold mb-8 transition-all active:scale-[0.985] ${btn.className}`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {btn.icon}
            {btn.label}
          </>
        )}
      </Button>

      {/* Features */}
      <div className="flex-1 pt-6 border-t border-border">
        {(index === 1 || index === 2) && (
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">
            {index === 1 ? "Tout Starter, plus :" : "Tout Pro, plus :"}
          </p>
        )}

        <ul className="space-y-3.5 text-sm">
          <li className="flex gap-3">
            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCurrent ? "text-primary" : "text-emerald-500"}`} />
            <span>Jusqu’à <strong>{plan.max_org}</strong> organisations</span>
          </li>
          <li className="flex gap-3">
            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCurrent ? "text-primary" : "text-emerald-500"}`} />
            <span><strong>{plan.max_ai_image}</strong> générations d’images IA</span>
          </li>
          <li className="flex gap-3">
            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCurrent ? "text-primary" : "text-emerald-500"}`} />
            <span><strong>{plan.max_post_month}</strong> posts par mois</span>
          </li>
          <li className="flex gap-3">
            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCurrent ? "text-primary" : "text-emerald-500"}`} />
            <span><strong>{plan.max_ai_caption}</strong> légendes IA</span>
          </li>

          {plan.features?.slice(0, 6).map((feature, i) => (
            <li key={i} className="flex gap-3">
              <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCurrent ? "text-primary" : "text-emerald-500"}`} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}