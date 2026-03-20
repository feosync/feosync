"use client";


import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const FinalCTA = () => {
  return (
    <section id="cta" className="py-24 px-6 w-full lg:h-[80vh]">
      <div
        id="cta"
        className="mx-auto w-full lg:max-w-5xl h-2/3 rounded-[32px] bg-gradient-to-br from-primary/10 to-accent/10 p-12 md:p-20 text-center border border-border"
      >
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-[clamp(28px,4vw,44px)] tracking-[-0.01em] text-google-dark mb-6"
        >
          Prêt à automatiser votre marketing ?
        </motion.h2>
        <p className="text-google-gray-ui mb-8 lg:mb-10 max-w-xl mx-auto">
          Rejoignez les entreprises malgaches qui gagnent du temps avec AutoPost
          Pro.
        </p>
        <div className="flex flex-col items-center gap-4">
          {/* <motion.button
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="h-14 px-4 lg:px-12 rounded-[24px] bg-google-blue text-primary-foreground font-ui text-lg font-medium w-full md:w-auto flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-google-blue/20 transition-all"
          >
            Créer mon compte <ArrowRight size={25} />
          </motion.button> */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-center lg:items-start justify-center lg:justify-start">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 rounded-[24px] bg-google-blue text-primary-foreground font-ui text-sm sm:text-base font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-google-blue/20 transition-all"
            >
              Commencer gratuitement <ArrowRight size={18} />
            </motion.button>
          </div>
          <p className="text-xs text-google-gray-mid">
            Sans carte bancaire · Annulation à tout moment
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
