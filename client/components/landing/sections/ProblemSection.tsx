"use client";

import { motion } from 'framer-motion';
import { Calendar, MessageSquare, BarChart3 } from 'lucide-react';

const painPoints = [
  { icon: Calendar, text: 'Des heures perdues à publier manuellement chaque jour' },
  { icon: MessageSquare, text: "Manque d'idées de contenu, audience qui stagne" },
  { icon: BarChart3, text: 'Aucune visibilité sur ce qui fonctionne vraiment' },
];

const ProblemSection = () => {
  return (
    <section id="problems" className="py-24 px-6 bg-google-bg-light">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-[clamp(28px,4vw,44px)] leading-tight tracking-[-0.01em] text-google-dark mb-6">
            La gestion manuelle vous coûte du temps et des clients
          </h2>
          <div className="flex items-center gap-8 p-8 bg-card rounded-2xl border border-google-border">
            <div className="w-32 h-32 shrink-0 relative hidden se:block">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="#F1F3F4" strokeWidth="12" fill="transparent" />
                <circle
                  cx="64" cy="64" r="58"
                  stroke="#1A73E8" strokeWidth="12" fill="transparent"
                  strokeDasharray="364" strokeDashoffset="72" strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold text-google-dark">
                80%
              </div>
            </div>

            <p className="text-google-gray-ui leading-relaxed">
              Des PME perdent des clients faute d'une présence régulière sur les réseaux sociaux.
            </p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {painPoints.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-card border border-google-border rounded-xl p-6 flex items-center gap-4 transition-shadow hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-full bg-google-bg-chip flex items-center justify-center text-google-blue shrink-0">
                <item.icon size={20} />
              </div>
              <span className="font-ui text-[15px] text-google-dark">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
