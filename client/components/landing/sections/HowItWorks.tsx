"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const steps = [
  { num: "01", title: "Connectez vos pages",         desc: "Liez vos pages Facebook & WhatsApp Business en un clic."                                        },
  { num: "02", title: "L'IA vous aide (Votre Assistance)", desc: "L'IA vous propose des visuels de qualité avec des variantes de légendes."                },
  { num: "03", title: "Publiez & analysez",           desc: "Planifiez, publiez et suivez vos performances automatiquement."                                },
];

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.5"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="py-24 px-6 bg-background" ref={containerRef} id="how-it-works">
      <div className="max-w-3xl mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.01em] text-foreground text-center mb-16"
        >
          De zéro à publié en 3 étapes
        </motion.h2>

        <div className="relative">

          {/* ── Ligne verticale ── */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-border">
            <motion.div
              style={{ height: lineHeight }}
              className="w-full bg-gradient-to-b from-primary to-chart-1"
            />
          </div>

          <div className="space-y-12">
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