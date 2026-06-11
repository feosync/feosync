"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Sparkles, Shield, Users, Heart,
} from "lucide-react";

const values = [
  {
    number: "01",
    icon: Sparkles,
    title: "Innovation audacieuse",
    description:
      "Nous repoussons les limites du possible. Chaque problème est une opportunité de réinventer, pas seulement d'améliorer.",
    color: "#4285F4",
    accent: "#4285F415",
  },
  {
    number: "02",
    icon: Shield,
    title: "Confiance absolue",
    description:
      "La sécurité et la transparence ne sont pas des options. Nous construisons des produits en lesquels nos utilisateurs peuvent avoir une confiance totale.",
    color: "#34A853",
    accent: "#34A85315",
  },
  {
    number: "03",
    icon: Users,
    title: "Collectif avant tout",
    description:
      "Les meilleures idées naissent de la diversité des esprits. Nous cultivons un environnement où chaque voix compte et chaque perspective enrichit.",
    color: "#EA4335",
    accent: "#EA433515",
  },
  {
    number: "04",
    icon: Heart,
    title: "Passion authentique",
    description:
      "Nous avons créer FeoSync pour changer la façon dont les gens interagissent avec les réseaux sociaux. Nous avons créer FeoSync parce que nous croyons sincèrement pouvoir changer quelque chose.",
    color: "#EA4335",
    accent: "#EA433515",
  },
];

// ── Single value card ────────────────────────────────────────────────────────
const ValueCard = ({
  value,
  index,
}: {
  value: (typeof values)[0];
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const Icon = value.icon;

  const isLarge = index === 0 || index === 3;
  const numColor = `${value.color}12`;

  return (
    <motion.div
      ref={ref}
      className={`relative rounded-2xl p-7 overflow-hidden group bg-card/90 border border-border/60 shadow-lg ${
        isLarge ? "md:col-span-2" : "md:col-span-1"
      }`}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: `0 20px 48px rgba(0,0,0,0.15), 0 0 0 1px ${value.color}30` }}
    >
      <span
        className="absolute -bottom-4 -right-2 font-ui font-black select-none pointer-events-none leading-none"
        style={{
          fontSize: "clamp(80px, 10vw, 120px)",
          color: numColor,
        }}
      >
        {value.number}
      </span>

      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at 0% 0%, ${value.color}18 0%, transparent 65%)`,
        }}
      />

      <motion.div
        className="relative w-11 h-11 rounded-xl flex items-center justify-center mb-5"
        style={{ background: value.accent, border: `1px solid ${value.color}30` }}
        whileHover={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 0.4 }}
      >
        <Icon size={20} style={{ color: value.color }} strokeWidth={1.8} />
      </motion.div>

      <h3 className="relative text-lg font-ui font-bold text-foreground mb-2 leading-snug">
        {value.title}
      </h3>
      <p className="relative text-sm leading-relaxed text-muted-foreground">
        {value.description}
      </p>

      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
        style={{ background: `linear-gradient(90deg, ${value.color}, transparent)` }}
      />
    </motion.div>
  );
};

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="text-center mb-16">
      <motion.div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-ui font-semibold mb-6 bg-primary/10 text-primary border border-primary/20"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        <Sparkles size={12} />
        Ce en quoi nous croyons
      </motion.div>

      <motion.h2
        className="font-ui font-black text-foreground leading-tight mb-4"
        style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        Nos{" "}
        <span className="relative inline-block text-primary">
          valeurs
          <svg
            className="absolute -bottom-1 left-0 w-full"
            viewBox="0 0 120 8"
            preserveAspectRatio="none"
            style={{ height: "6px" }}
          >
            <motion.path
              d="M2 5 Q30 1 60 5 Q90 9 118 5"
              fill="none"
              stroke="#4285F4"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            />
          </svg>
        </span>
      </motion.h2>

      <motion.p
        className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Quatre principes fondateurs qui guident chacune de nos décisions, de la
        première ligne de code à la dernière interaction utilisateur.
      </motion.p>
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────
const Values = () => {
  return (
    <section id="values"
      className="relative py-28 px-6 bg-background overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, rgba(66,133,244,0.06) 0%, transparent 60%)",
      }}
    >
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "rgba(66,133,244,0.04)", filter: "blur(80px)", transform: "translate(-40%, -40%)" }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "rgba(234,67,53,0.04)", filter: "blur(100px)", transform: "translate(40%, 40%)" }} />

      <div className="relative max-w-5xl mx-auto">
        <SectionHeader />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ValueCard value={values[0]} index={0} />
          <ValueCard value={values[1]} index={1} />
          <ValueCard value={values[2]} index={2} />
          <ValueCard value={values[3]} index={3} />
        </div>
      </div>
    </section>
  );
};

export default Values;