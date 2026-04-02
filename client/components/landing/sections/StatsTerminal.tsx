"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  {
    value: 24,
    suffix: "/7",
    label: "Présence Digitale",
    description: "Votre entreprise reste active même quand vous dormez.",
    icon: "🤖",
    from: "from-primary",
    to: "to-chart-1",
  },
  {
    value: 90,
    suffix: "%",
    label: "Réduction d'effort",
    description: "De temps gagné sur la création de vos contenus IA.",
    icon: "⚡",
    from: "from-chart-1",
    to: "to-chart-2",
  },
  {
    value: 15,
    suffix: "h+",
    label: "Liberté retrouvée",
    description: "Heures économisées par mois en moyenne par gérant.",
    icon: "⏱️",
    from: "from-chart-2",
    to: "to-primary",
  },
];

function useCountUp(end: number, duration: number, start: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / (duration * 1000), 1);
      setVal(Number((progress * end).toFixed(end % 1 === 0 ? 0 : 1)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, end, duration]);
  return val;
}

const StatCard = ({
  stat,
  index,
  isInView,
}: {
  stat: (typeof stats)[0];
  index: number;
  isInView: boolean;
}) => {
  const count = useCountUp(stat.value, 2, isInView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-8
                      transition-shadow duration-300
                      group-hover:shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.15)]"
      >
        {/* Barre accent haut */}
        <div
          className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.from} ${stat.to} opacity-70`}
        />

        {/* Icône */}
        <div className="mb-6 text-3xl">{stat.icon}</div>

        {/* Valeur */}
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-semibold tracking-tight text-foreground lg:text-6xl">
            {count}
          </span>
          <span
            className={`bg-gradient-to-r ${stat.from} ${stat.to} bg-clip-text text-3xl font-semibold text-transparent lg:text-4xl`}
          >
            {stat.suffix}
          </span>
        </div>

        {/* Label */}
        <h3 className="mt-3 text-lg font-semibold text-foreground">
          {stat.label}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{stat.description}</p>

        {/* Barre de progression animée */}
        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: "100%" } : {}}
            transition={{
              duration: 2,
              delay: index * 0.15 + 0.3,
              ease: "easeOut",
            }}
            className={`h-full rounded-full bg-gradient-to-r ${stat.from} ${stat.to}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

const StatsTerminal = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="stats" className="py-24 px-6 bg-background">
      <div className="mx-auto max-w-6xl" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-primary">
            📊 Chiffres clés
          </span>
          <h2
            className="mt-6 text-foreground font-bold"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              letterSpacing: "-0.01em",
            }}
          >
            Optimisez votre croissance digitale{" "}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground leading-7">
            FeoSync est conçu pour maximiser votre impact tout en minimisant votre temps de gestion.
          </p>
        </motion.div>

        {/* Grille */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, idx) => (
            <StatCard key={idx} stat={stat} index={idx} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsTerminal;
