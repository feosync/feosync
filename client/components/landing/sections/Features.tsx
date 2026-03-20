"use client";

import { motion } from 'framer-motion';
import { Cpu, Calendar, BarChart3, MessageSquare, Globe, ShieldCheck } from 'lucide-react';

const features = [
  { title: 'Assistant IA', desc: 'Visuels + légendes générés en 1 clic selon votre ton.', icon: Cpu },
  { title: 'Planification de post', desc: 'Publications automatiques sans aucune intervention.', icon: Calendar },
  { title: 'Analytics H+24', desc: 'Métriques Facebook Insights en temps réel.', icon: BarChart3 },
  { title: 'WhatsApp Business', desc: 'Diffusion auto sur vos listes de contacts.', icon: MessageSquare },
  { title: 'Templates Brandés', desc: 'Logo, couleurs et identité préservés.', icon: Globe },
  { title: 'Notifications Live', desc: 'Push à chaque publication réussie.', icon: ShieldCheck },
];

const Features = () => {
  return (
    <section className="py-24 px-6" id="features">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-[clamp(28px,4vw,44px)] tracking-[-0.01em] text-google-dark mb-4"
          >
            Tout ce dont vous avez besoin. Rien de superflu.
          </motion.h2>
          <p className="text-google-gray-ui">
            Une suite complète d'outils pilotés par l'intelligence artificielle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group bg-card border border-google-border rounded-xl p-6 transition-all hover:shadow-md hover:border-google-blue"
            >
              <f.icon className="text-google-blue mb-4 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="font-ui font-medium text-lg text-google-dark mb-2">{f.title}</h3>
              <p className="text-google-gray-ui text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
