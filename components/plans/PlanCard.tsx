"use client";

import { Button } from "@/components/ui/button";
import { Check, ArrowUp, ArrowDown, Lock, Sparkles, Zap } from "lucide-react";
import type { Plan } from "@/lib/api/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlanAction = "CREATE" | "UPGRADE" | "DOWNGRADE" | "CURRENT" | "UNAVAILABLE";

interface ButtonConfig {
  label: string;
  icon: React.ReactNode;
  className: string;
}

interface PlanCardProps {
  plan: Plan & { description?: string };
  index: number;
  currentPlan: Plan | null;
  currentPlanIndex: number;
  onSubscribe: (plan: Plan, action: PlanAction) => void;
  isLoading: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FEATURE_SECTION_PREFIX: Record<number, string> = {
  1: "Tout Starter, plus :",
  2: "Tout Pro, plus :",
};

// Styles Tailwind réutilisables
const CLS = {
  primary:   "text-primary-foreground hover:bg-primary/90 font-semibold",
  green:     "bg-green-500 text-primary-foreground hover:bg-green-600 font-semibold",
  secondary: "bg-secondary hover:bg-secondary/80 text-foreground border border-border font-medium",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPlanAction(
  plan: Plan,
  currentPlan: Plan | null,   // â changÃ© : Plan | null au lieu de number | null
  planIndex: number,
  currentPlanIndex: number
): PlanAction {
  console.log(plan)
  if (!plan.is_active)                      return "UNAVAILABLE";
  if (currentPlan && plan.id === currentPlan.id) return "CURRENT";
  if (!currentPlan || currentPlan.price === 0)   return "CREATE";
  return planIndex > currentPlanIndex ? "UPGRADE" : "DOWNGRADE";
}

function getButtonConfig(
  plan: Plan,
  action: PlanAction,
  index: number,
  hasNoPlan: boolean
): ButtonConfig {
  // ── États statiques ───────────────────────────────────────────────────────
  if (action === "CURRENT") return {
    label: "Plan actuel",
    icon: <Check className="w-4 h-4 mr-2" />,
    className: "bg-muted text-muted-foreground cursor-default",
  };

  if (action === "UNAVAILABLE") return {
    label: "Indisponible",
    icon: <Lock className="w-4 h-4 mr-2" />,
    className: "opacity-50 cursor-not-allowed",
  };

  // ── Utilisateur sans plan actif ───────────────────────────────────────────
  if (hasNoPlan) {
    const noPlanConfigs: Record<number, ButtonConfig> = {
      0: {
        label: plan.price === 0 ? "Commencer gratuitement" : "Choisir Starter",
        icon: null,
        className: CLS.secondary,
      },
      1: {
        label: "Choisir le plus populaire",
        icon: <Sparkles className="w-4 h-4 mr-2" />,
        className: "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
      },
      2: {
        label: "Passer au plan Pro",
        icon: <Zap className="w-4 h-4 mr-2" />,
        className: "bg-green-500 text-primary-foreground hover:brightness-105 font-semibold",
      },
    };
    if (index in noPlanConfigs) return noPlanConfigs[index];
  }

  // ── Upgrade ───────────────────────────────────────────────────────────────
  if (action === "UPGRADE") return index === 2
    ? { label: `Upgrader vers ${plan.name}`, icon: <Sparkles className="w-4 h-4 mr-2" />, className: CLS.green }
    : { label: `Upgrader vers ${plan.name}`, icon: <ArrowUp   className="w-4 h-4 mr-2" />, className: CLS.primary };

  // ── Downgrade ─────────────────────────────────────────────────────────────
  if (action === "DOWNGRADE") return {
    label: `Passer à ${plan.name}`,
    icon: <ArrowDown className="w-4 h-4 mr-2" />,
    className: index === 0 ? CLS.secondary : CLS.primary,
  };

  // ── Fallback CREATE ───────────────────────────────────────────────────────
  return {
    label: `Choisir ${plan.name}`,
    icon: null,
    className: "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureItem({ isCurrent, children }: { isCurrent: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCurrent ? "text-primary" : "text-success"}`} />
      <span>{children}</span>
    </li>
  );
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

export function PlanCard({
  plan,
  index,
  currentPlan,
  currentPlanIndex,
  onSubscribe,
  isLoading,
}: PlanCardProps) {
  const hasNoPlan = currentPlan === null;
  const action    = getPlanAction(plan, currentPlan, index, currentPlanIndex);
  const isCurrent = action === "CURRENT";
  const isPopular = index === 1;
  const btn       = getButtonConfig(plan, action, index, hasNoPlan);

  const cardClass = [
    "group relative flex flex-col rounded-3xl p-7 sm:p-8 bg-card border transition-all duration-300",
    isCurrent
      ? "border-primary/60 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
      : "border-border hover:border-border/80",
    isPopular ? "scale-[1.03] md:scale-[1.05] border-primary/30" : "",
  ].join(" ");

  // Features fixes issues du plan
  const planMetaFeatures: { label: React.ReactNode }[] = [
    { label: <>Jusqu'à <strong>{plan.max_org}</strong> organisations</> },
    { label: <><strong>{plan.max_ai_image}</strong> générations d'images IA</> },
    { label: <><strong>{plan.max_post_month}</strong> posts par mois</> },
    { label: <><strong>{plan.max_ai_caption}</strong> légendes IA</> },
  ];

  return (
    <div role="article" aria-label={`Plan ${plan.name}`} className={cardClass}>

      {/* Badge "populaire" */}
      {isPopular && !isCurrent && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-4 py-1 rounded-full shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            Le plus populaire
          </div>
        </div>
      )}

      {/* Barre d'accentuation (plan actuel) */}
      {isCurrent && (
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-linear-to-r from-transparent via-primary to-transparent" />
      )}

      {/* Nom & description */}
      <div className="mb-6">
        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">{plan.name}</h3>
        {plan.description && (
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        )}
      </div>

      {/* Prix */}
      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl sm:text-6xl font-bold tracking-tighter text-foreground">
            {plan.price.toLocaleString("fr-MG")}
          </span>
          <span className="text-muted-foreground text-lg">Ar</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">par mois</p>
      </div>

      {/* Bouton CTA */}
      <Button
        onClick={() => onSubscribe(plan, action)}
        disabled={action === "CURRENT"}
        loading={isLoading}
        className={`w-full h-12 rounded-2xl text-base font-semibold mb-8 transition-all active:scale-[0.985] ${btn.className}`}
      >
        {btn.icon}{btn.label}
      </Button>

      {/* Liste des fonctionnalités */}
      <div className="flex-1 pt-4 border-t border-border">
        {FEATURE_SECTION_PREFIX[index] && (
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">
            {FEATURE_SECTION_PREFIX[index]}
          </p>
        )}

        <ul className="space-y-3.5 text-sm">
          {planMetaFeatures.map(({ label }, i) => (
            <FeatureItem key={i} isCurrent={isCurrent}>{label}</FeatureItem>
          ))}
          {plan.features?.slice(0, 6).map((feature, i) => (
            <FeatureItem key={`f-${i}`} isCurrent={isCurrent}>{feature}</FeatureItem>
          ))}
        </ul>
      </div>

    </div>
  );
}