"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/landing/SectionHeader";

const plans = [
  {
    name: "Starter",
    monthly: "29 000",
    annual: "23 200",
    description: "L'essentiel pour automatiser votre présence Facebook.",
    features: [
      "1 Page Facebook",
      "20 Posts programmés / mois",
      "IA Texte Illimitée",
      "0 Image incluse (Option Token dispo 💡)", // Précision sur l'achat à la carte
      "Calendrier de contenu",
      "Support standard",
    ],
    cta: "Démarrer avec Starter",
  },
  {
    name: "Pro",
    monthly: "59 000",
    annual: "47 200",
    featured: true,
    description: "Le pack complet : IA Illimitée & WhatsApp Business.",
    features: [
      "5 Pages Facebook incluses",
      "Diffusion WhatsApp Business 📲",
      "IA Texte Illimitée",
      "30 Images IA incluses / mois",
      "+ Option de Tokens images à volonté", // Flexibilité mise en avant
      "Automatisation des Avis Clients",
      "Analytics & Rapports",
    ],
    cta: "Choisir le Plan Pro",
  },
  {
    name: "Agency",
    monthly: "99 000",
    annual: "79 200",
    description: "Puissance maximale pour les agences.",
    features: [
      "Pages Facebook Illimitées",
      "Gestion Multi-clients",
      "Images IA TOTALEMENT ILLIMITÉES 🚀", // Argument massue pour l'Agency
      "Rapports en Marque Blanche",
      "Support Prioritaire 24h/7j",
      "Accès API & Webhooks",
    ],
    cta: "Passer à l'échelle Agency",
  },
];
const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-24 px-6 bg-background" id="pricing">
      <div className="max-w-7xl mx-auto text-center">
        {/* ── Titre ── */}
        <SectionHeader title="Tarifs transparents. Aucune surprise." />

        {/* ── Toggle mensuel / annuel ── */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span
            className={`text-sm transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}
          >
            Mensuel
          </span>

          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              isAnnual ? "bg-primary" : "bg-secondary"
            }`}
            aria-label="Toggle annual pricing"
          >
            <motion.div
              animate={{ x: isAnnual ? 26 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-primary-foreground shadow-sm"
            />
          </button>

          <span
            className={`text-sm transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}
          >
            Annuel <span className="text-chart-1 font-bold ml-1">−20%</span>
          </span>
        </div>

        {/* ── Grille plans ── */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className={`bg-card rounded-xl p-6 transition-all hover:shadow-md relative ${
                plan.featured
                  ? "border-2 border-primary shadow-[0_0_30px_hsl(var(--primary)/0.12)]"
                  : "border border-border"
              }`}
            >
              {/* Badge recommandé */}
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold">
                  RECOMMANDÉ
                </span>
              )}

              <h3 className="text-xl font-semibold text-foreground mb-2">
                {plan.name}
              </h3>

              {/* Prix animé */}
              <div className="mb-6">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isAnnual ? "annual" : "monthly"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-3xl font-bold text-foreground inline-block"
                  >
                    {isAnnual ? plan.annual : plan.monthly} Ar
                  </motion.span>
                </AnimatePresence>
                <span className="text-muted-foreground text-sm">/mois</span>
              </div>

              {/* Features */}
              <ul className="text-left space-y-4 mb-8">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 size={16} className="text-chart-1 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-[24px] text-sm font-medium transition-all ${
                  plan.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                    : "border border-border text-primary hover:bg-secondary"
                }`}
              >
                Choisir {plan.name}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
