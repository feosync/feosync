import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import StatsTerminal from "@/components/landing/StatsTerminal";
import Pricing from "@/components/landing/Pricing";
import IntegrationsMarquee from "@/components/landing/IntegrationsMarquee";
import Testimonials from "@/components/landing/Testimonials";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother"; // ✅ import séparé
import { useRef } from "react";

// ✅ Hors du composant — une seule fois au chargement du module
gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

const Index = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // ✅ ScrollSmoother.create() DANS useGSAP — cleanup automatique au unmount
    ScrollSmoother.create({
      wrapper:       wrapperRef.current!,
      content:       contentRef.current!,
      smooth:        1,
      effects:       true,
      smoothTouch:   0.1,
      normalizeScroll: true,
    });

    // ✅ ScrollTrigger dans le même useGSAP
    gsap.to("#cta", {
      scale: 1.3,
      duration: 2,
      scrollTrigger: {
        trigger: "#cta",
        start:   "top 85%",
        end:     "top 35%",
        scrub:   true,
        markers: true,
      },
    });

  }, { scope: wrapperRef }); // ✅ scope sur le wrapper div

  return (
    // ✅ <div> au lieu de <body>
    <div ref={wrapperRef} id="smooth-wrapper">
      <div ref={contentRef} id="smooth-content">
        <div className="min-h-screen bg-background font-body text-foreground selection:bg-google-bg-chip selection:text-google-blue overflow-hidden">
          <Navbar />
          <main>
            <Hero />
            <ProblemSection />
            <HowItWorks />
            <Features />
            <StatsTerminal />
            <Pricing />
            <IntegrationsMarquee />
            <Testimonials />
            <FinalCTA />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;