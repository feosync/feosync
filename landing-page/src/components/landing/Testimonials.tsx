import { motion } from "framer-motion";

const testimonials = [
  {
    initials: "RN",
    name: "Rina Nomena",
    role: "Gérante, Café Meva",
    quote:
      "Depuis que j'utilise AutoPost Pro, mes ventes ont augmenté de 40%. Je ne passe plus mes soirées à créer des posts.",
    color: "bg-google-blue",
    data: "1.5",
  },
  {
    initials: "JA",
    name: "Jean-André",
    role: "Directeur, Agence DigiMada",
    quote:
      "On gère 15 clients avec un seul outil. L'IA Gemini produit du contenu de qualité professionnelle en secondes.",
    color: "bg-google-teal",
    data: "2",
  },
  {
    initials: "SR",
    name: "Sarah R.",
    role: "Fondatrice, TanaBoutic",
    quote:
      "La planification automatique a transformé notre workflow. Plus besoin de se réveiller à 6h pour poster.",
    color: "bg-google-green",
    data: "2.5",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-[clamp(28px,4vw,44px)] tracking-[-0.01em] text-google-dark text-center mb-16"
        >
          Ils nous font confiance
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8" data-speed="1.1">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`bg-card border border-google-border rounded-xl p-6 ${i === 1 ? "md:-mt-4" : i === 2 ? "md:mt-4" : ""}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-primary-foreground text-sm font-bold font-ui`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-ui font-medium text-sm text-google-dark">
                    {t.name}
                  </p>
                  <p className="text-xs text-google-gray-mid">{t.role}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-google-teal text-sm">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-google-gray-ui text-sm leading-relaxed italic">
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
