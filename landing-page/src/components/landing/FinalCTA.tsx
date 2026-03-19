import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="py-24 px-6" id="cta">
      <div className="max-w-5xl mx-auto rounded-[32px] bg-gradient-to-br from-primary/10 to-accent/10 p-12 md:p-20 text-center border border-border">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-[clamp(28px,4vw,44px)] tracking-[-0.01em] text-google-dark mb-6"
        >
          Prêt à automatiser votre marketing ?
        </motion.h2>
        <p className="text-google-gray-ui mb-10 max-w-xl mx-auto">
          Rejoignez les entreprises malgaches qui gagnent du temps avec AutoPost Pro.
        </p>
        <div className="flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="h-14 px-12 rounded-[24px] bg-google-blue text-primary-foreground font-ui text-lg font-medium w-full md:w-auto flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-google-blue/20 transition-all"
          >
            Créer mon compte gratuit <ArrowRight size={20} />
          </motion.button>
          <p className="text-xs text-google-gray-mid">
            Sans carte bancaire · Annulation à tout moment
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
