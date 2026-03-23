import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    monthly: '0',
    annual: '0',
    features: ['1 page Facebook', '10 posts / mois', 'Templates de base'],
  },
  {
    name: 'Pro',
    monthly: '29 000',
    annual: '23 200',
    featured: true,
    features: ['3 pages Facebook', 'WhatsApp Business', 'IA Gemini illimitée', 'Analytics avancés'],
  },
  {
    name: 'Agency',
    monthly: '79 000',
    annual: '63 200',
    features: ['Pages illimitées', 'Multi-clients', 'Accès API', 'Support prioritaire'],
  },
];

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-24 px-6" id="tarifs">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-[clamp(28px,4vw,44px)] tracking-[-0.01em] text-google-dark mb-4"
        >
          Tarifs transparents. Aucune surprise.
        </motion.h2>

        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-sm font-ui ${!isAnnual ? 'text-google-dark' : 'text-google-gray-ui'}`}>
            Mensuel
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-google-bg-chip relative transition-colors"
            aria-label="Toggle annual pricing"
          >
            <motion.div
              animate={{ x: isAnnual ? 26 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-google-blue"
            />
          </button>
          <span className={`text-sm font-ui ${isAnnual ? 'text-google-dark' : 'text-google-gray-ui'}`}>
            Annuel <span className="text-google-teal font-bold ml-1">−20%</span>
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className={`bg-card border rounded-xl p-6 transition-shadow hover:shadow-md relative ${
                plan.featured ? 'border-2 border-google-blue' : 'border-google-border'
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-google-bg-chip text-google-blue px-4 py-1 rounded-full text-xs font-bold font-ui">
                  RECOMMANDÉ
                </span>
              )}
              <h3 className="font-ui text-xl font-medium text-google-dark mb-2">{plan.name}</h3>
              <div className="mb-6">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isAnnual ? 'annual' : 'monthly'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-3xl font-display font-bold text-google-dark inline-block"
                  >
                    {isAnnual ? plan.annual : plan.monthly} Ar
                  </motion.span>
                </AnimatePresence>
                <span className="text-google-gray-ui text-sm">/mois</span>
              </div>
              <ul className="text-left space-y-4 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-google-gray-ui">
                    <CheckCircle2 size={16} className="text-google-green shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-[24px] font-ui text-sm font-medium transition-all ${
                  plan.featured
                    ? 'bg-google-blue text-primary-foreground hover:shadow-lg hover:shadow-google-blue/20'
                    : 'border border-google-border text-google-blue hover:bg-google-bg-chip'
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
