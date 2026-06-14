"use client";

import { motion } from "framer-motion";
import { Clock, TrendingDown, BarChart3, AlertTriangle, CheckCircle2, Quote } from "lucide-react";

const painPoints = [
  {
    icon: Clock,
    number: "01",
    title: "Perte de temps",
    description: "Vous passez vos soirées et vos week-ends à programmer des posts — au lieu de développer ce qui fait vraiment avancer votre business.",
    highlight: "Ce temps ne revient jamais.",
  },
  {
    icon: TrendingDown,
    number: "02",
    title: "Perte de momentum",
    description: "Votre audience stagne malgré vos efforts. Sans régularité ni stratégie, les algorithmes vous ignorent — et vos concurrents avancent.",
    highlight: "La constance fait la différence. Pas l'intensité.",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Perte de visibilité",
    description: "Vous publiez dans le vide, sans savoir ce qui fonctionne vraiment. Chaque post est une intuition — rarement une décision.",
    highlight: "Sans données, vous naviguez à l'aveugle.",
  },
];

const ProblemSection = () => {
  return (
    <section id="problems" className="relative py-28 px-6 bg-background overflow-hidden">

      {/* Halo décoratif rouge — signal de danger ambiant */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2
                      w-[600px] h-[300px] rounded-full
                      bg-destructive/6 blur-[100px]" />

      <div className="max-w-7xl xl:max-w-5/6 mx-auto space-y-10 lg:space-y-16">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >

          {/* Titre en rouge — le danger est réel */}
          <h2 className="text-[clamp(28px,4.5vw,46px)] font-bold leading-[1.1]
                         tracking-[-0.03em] text-destructive">
            La gestion manuelle vous coûte
            <br />
            bien plus que du temps.
          </h2>

          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Chaque jour sans automatisation, vous perdez sur trois fronts.
          </p>
        </motion.div>

        {/* ── PAIN POINTS — 3 colonnes ── */}
        <div className="grid md:grid-cols-3 gap-4">
          {painPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative bg-card border border-border rounded-2xl p-6
                         hover:border-destructive/40 hover:shadow-lg
                         hover:shadow-destructive/5 transition-all duration-300
                         overflow-hidden "
            >
              {/* Coin décoratif rouge */}
              <div className="absolute top-0 right-0 w-16 h-16
                              bg-destructive/5 rounded-bl-[40px]
                              group-hover:bg-destructive/10 transition-colors" />

              {/* Icône */}
              <div className="w-11 h-11 rounded-xl bg-destructive/10
                             flex items-center justify-center text-destructive
                             group-hover:bg-destructive/20 transition-colors mb-4">
                <point.icon size={20} strokeWidth={1.5} />
              </div>

              {/* Titre rouge */}
              <h3 className="text-base font-bold bg-background text-destructive mb-3 tracking-[-0.01em] px-2 rounded-full w-max">
                {point.title}
              </h3>

              {/* Description */}
              <p className="text-[14px] text-foreground/90 leading-relaxed mb-4">
                {point.description}
              </p>

              {/* Highlight — séparateur + sous-ligne */}
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <div className="w-3 h-[1.5px] bg-foreground/40 shrink-0 rounded-full" />
                <p className="text-[12px] text-foreground/70 font-normal italic">
                  {point.highlight}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── SOCIAL PROOF — redesigné ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="relative bg-card border border-border rounded-2xl p-8
                     overflow-hidden max-w-3xl mx-auto"
        >
          {/* Guillemet géant décoratif */}
          <Quote
            size={80}
            className="absolute -top-2 -left-2 text-muted-foreground/6
                       rotate-180 pointer-events-none"
          />

          <div className="relative space-y-5">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em]
                               text-muted-foreground/60">
                Ce qu'on entend chaque jour
              </span>
            </div>

            {/* Citation */}
            <p className="text-[16px] text-foreground leading-relaxed font-medium italic">
              "La plupart des entrepreneurs et community managers qu'on a rencontrés
              nous ont dit la même chose : ils passaient plus de temps à gérer leurs
              outils qu'à parler à leur audience."
            </p>

            {/* Signature */}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <div className="w-9 h-9 rounded-full bg-primary/15
                             flex items-center justify-center
                             text-primary text-xs font-bold shrink-0">
                FS
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground">
                  L'équipe FeoSync
                </p>
                <p className="text-[11px] text-muted-foreground/50">
                  Fondateurs · Madagascar
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── GOOD NEWS — pivot émotionnel ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl
                     bg-primary/5 border border-primary/20
                     p-8 max-w-3xl mx-auto text-center"
        >
          {/* Halo vert/primary derrière */}
          <div className="pointer-events-none absolute inset-0
                          bg-gradient-to-b from-primary/5 to-transparent" />

          <div className="relative space-y-4">
            {/* Eyebrow — signal positif */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                            border border-primary/25 bg-primary/8 mx-auto">
              <CheckCircle2 size={12} className="text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                La bonne nouvelle
              </span>
            </div>

            {/* Déclaration principale */}
            <p className="text-[clamp(20px,3vw,28px)] font-bold tracking-[-0.02em]
                          text-foreground leading-tight">
              Tout ça n'est pas une fatalité.
            </p>

            {/* Value proposition */}
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xl mx-auto">
              FeoSync existe précisément pour que vous n'ayez{" "}
              <span className="text-primary font-semibold">
                plus jamais à choisir entre être présent et être libre.
              </span>
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ProblemSection;