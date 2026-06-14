"use client";

import { Navbar } from "@/components/layout/Navbar";
import Hero from "@/components/landing/sections/Hero";
import ProblemSection from "@/components/landing/sections/ProblemSection";
import HowItWorks from "@/components/landing/sections/HowItWorks";
import Features from "@/components/landing/sections/Features";
import StatsTerminal from "@/components/landing/sections/StatsTerminal";
import Pricing from "@/components/landing/sections/Pricing";
import IntegrationsMarquee from "@/components/landing/sections/IntegrationsMarquee";
import Testimonials from "@/components/landing/sections/Testimonials";
import FinalCTA from "@/components/landing/sections/FinalCTA";
import Footer from "@/components/landing/sections/Footer";
import About from "@/components/landing/sections/About";
import Values from "@/components/landing/sections/Values";
import { SmoothScroll } from "@/components/SmoothScroll";
import { montserrat } from "@/lib/fonts";

export default function LandingPage() {
  return (
    <SmoothScroll>
      <div className={`min-h-screen bg-background text-foreground ${montserrat.className}`}>
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
            <About />
            <Values />
          </main>
          <Footer />
      </div>
    </SmoothScroll>
  );
}
