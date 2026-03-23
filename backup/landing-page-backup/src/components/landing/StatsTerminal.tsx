import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  {
    value: 500,
    suffix: '+',
    label: 'Publications automatisées',
    description: 'Posts générés et publiés par notre IA',
    icon: '📤',
    gradient: 'from-[hsl(var(--google-blue))] to-[hsl(var(--google-teal))]',
  },
  {
    value: 98.4,
    suffix: '%',
    label: 'Taux de succès',
    description: 'De publications livrées sans erreur',
    icon: '✅',
    gradient: 'from-[hsl(var(--google-teal))] to-[hsl(var(--google-green))]',
  },
  {
    value: 6,
    suffix: 'h',
    prefix: '~',
    label: 'Temps économisé',
    description: 'Par semaine en moyenne par client',
    icon: '⏱️',
    gradient: 'from-[hsl(var(--google-green))] to-[hsl(var(--google-blue))]',
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

const StatCard = ({ stat, index, isInView }: { stat: typeof stats[0]; index: number; isInView: boolean }) => {
  const count = useCountUp(stat.value, 2, isInView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-shadow duration-300 group-hover:shadow-[0_20px_60px_-15px_rgba(26,115,232,0.15)]">
        {/* Subtle gradient accent top border */}
        {/* <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-80`} /> */}

        {/* Icon */}
        <div className="mb-6 text-3xl">{stat.icon}</div>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          <span className="font-display text-5xl font-medium tracking-tight text-foreground lg:text-6xl">
            {stat.prefix || ''}{count}
          </span>
          <span className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-3xl font-medium text-transparent lg:text-4xl`}>
            {stat.suffix}
          </span>
        </div>

        {/* Label */}
        <h3 className="mt-3 font-ui text-lg font-medium text-foreground">
          {stat.label}
        </h3>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          {stat.description}
        </p>

        {/* Animated progress line */}
        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: '100%' } : {}}
            transition={{ duration: 2, delay: index * 0.15 + 0.3, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

const StatsTerminal = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-6 bg-background">
      <div className="mx-auto max-w-6xl" ref={ref}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 font-ui text-xs font-medium text-primary">
            📊 Chiffres clés
          </span>
          <h2 className="mt-6 font-display text-foreground" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, letterSpacing: '-0.01em' }}>
            Des résultats qui parlent d'eux-mêmes
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-base text-muted-foreground" style={{ lineHeight: 1.75 }}>
            Nos clients gagnent du temps et augmentent leur visibilité dès la première semaine.
          </p>
        </motion.div>

        {/* Stats grid */}
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
