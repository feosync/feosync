"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section id="cta" className="py-24 px-6 w-full lg:h-[80vh] bg-background">
      <div className="mx-auto w-full lg:max-w-5xl h-2/3 rounded-[32px]
                      bg-gradient-to-br from-primary/10 to-chart-2/10
                      p-12 md:p-20 text-center border border-border">

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.01em] text-foreground mb-6"
        >
          Prêt à automatiser votre marketing ?
        </motion.h2>

        <p className="text-muted-foreground mb-8 lg:mb-10 max-w-xl mx-auto">
          Rejoignez les entreprises malgaches qui gagnent du temps avec AutoPost Pro.
        </p>

        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 rounded-[24px]
                         bg-primary text-primary-foreground
                         text-sm sm:text-base font-medium
                         flex items-center justify-center gap-2
                         hover:bg-primary/90
                         hover:shadow-lg hover:shadow-primary/20 transition-all"
            >
              Commencer gratuitement <ArrowRight size={18} />
            </motion.button>
          </div>

          <p className="text-xs text-muted-foreground/60">
            Sans carte bancaire · Annulation à tout moment
          </p>
        </div>

      </div>
    </section>
  );
};

export default FinalCTA;