"use client";

import { motion } from "framer-motion";

const steps = [
    {
    num: "01",
    title: "Créez votre compte FeoSync",
    desc: "Inscrivez-vous en 30 secondes, aucune carte bancaire requise.",
  },
  {
    num: "02",
    title: "Connectez vos réseaux sociaux",
    desc: "Liez Facebook, Instagram ou LinkedIn via une connexion sécurisée OAuth.",
  },
  {
    num: "03",
    title: "L'IA génère votre contenu",
    desc: "Légendes, visuels, hashtags — générés en quelques secondes.",
  },
  {
    num: "04",
    title: "Publiez et mesurez vos performances",
    desc: "Planifiez et suivez vos résultats en temps réel depuis un seul tableau de bord.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-6 bg-background" id="how-it-works">
      <div className="max-w-3xl mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.01em] text-foreground text-center mb-10 sm:mb-16"
        >
          De zéro à publié en 4 étapes
        </motion.h2>

        <div className="relative">

          {/* ── Ligne verticale ── */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-border">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-full bg-gradient-to-b from-primary to-chart-1 origin-top"
            />
          </div>

          <div className="space-y-8 sm:space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative pl-16 md:pl-20"
              >
                {/* ── Pastille ── */}
                <div className="absolute left-3 md:left-5 w-6 h-6 rounded-full bg-primary flex items-center justify-center ring-4 ring-background">
                  <span className="text-[10px] text-primary-foreground font-mono font-medium">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
