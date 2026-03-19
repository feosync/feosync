import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import ProblemSection from '@/components/landing/ProblemSection';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import StatsTerminal from '@/components/landing/StatsTerminal';
import Pricing from '@/components/landing/Pricing';
import IntegrationsMarquee from '@/components/landing/IntegrationsMarquee';
import Testimonials from '@/components/landing/Testimonials';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-body text-foreground selection:bg-google-bg-chip selection:text-google-blue">
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
  );
};

export default Index;
