"use client";

import { motion } from "framer-motion";
const testimonials = [
  {
    initials: "IA",
    name: "Intelligence Locale",
    role: "Intélligence Artificielle",
    quote: "Nos algorithmes sont optimisés pour comprendre le contexte du marché malgache et générer du contenu qui résonne avec votre audience locale.",
    colorClass: "bg-primary",
  },
  {
    initials: "SÉ",
    name: "Sécurité & Meta",
    role: "Conformité API",
    quote: "Nous utilisons les accès officiels Meta pour garantir que votre page Facebook reste en sécurité. Vos données sont chiffrées et protégées.",
    colorClass: "bg-chart-1",
  },
  {
    initials: "SU",
    name: "Support de Proximité",
    role: "Basé à Madagascar",
    quote: "Une question ? Notre équipe vous accompagne en français et en malgache pour configurer vos automatisations et booster vos ventes.",
    colorClass: "bg-chart-2",
  },
];

// const testimonials = [
//   {
//     initials: "RN",
//     name: "Rina Nomena",
//     role: "Gérante, Café Meva",
//     quote: "Depuis que j'utilise AutoPost Pro, mes ventes ont augmenté de 40%. Je ne passe plus mes soirées à créer des posts.",
//     colorClass: "bg-primary",
//   },
//   {
//     initials: "JA",
//     name: "Jean-André",
//     role: "Directeur, Agence DigiMada",
//     quote: "On gère 15 clients avec un seul outil. L'IA Gemini produit du contenu de qualité professionnelle en secondes.",
//     colorClass: "bg-chart-1",
//   },
//   {
//     initials: "SR",
//     name: "Sarah R.",
//     role: "Fondatrice, TanaBoutic",
//     quote: "La planification automatique a transformé notre workflow. Plus besoin de se réveiller à 6h pour poster.",
//     colorClass: "bg-chart-2",
//   },
// ];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.01em] text-foreground text-center mb-16"
        >
          {/* Ils nous font confiance */}
          Pourquoi choisir FeoSync?
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`bg-card border border-border rounded-xl p-6
                          transition-all hover:shadow-md hover:border-primary/30
                          ${i === 1 ? "md:-mt-4" : i === 2 ? "md:mt-4" : ""}`}
            >
              {/* Avatar + identité */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full ${t.colorClass} flex items-center justify-center text-primary-foreground text-sm font-bold`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>

              {/* Étoiles */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-chart-1 text-sm">★</span>
                ))}
              </div>

              {/* Citation */}
              <p className="text-muted-foreground text-sm leading-relaxed italic">
                "{t.quote}"
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;