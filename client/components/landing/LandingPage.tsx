'use client'

// import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {Navbar} from '@/components/layout/Navbar'
import Hero from '@/components/landing/sections/Hero'
import ProblemSection from '@/components/landing/sections/ProblemSection'
import HowItWorks from '@/components/landing/sections/HowItWorks'
import Features from '@/components/landing/sections/Features'
import StatsTerminal from '@/components/landing/sections/StatsTerminal'
import Pricing from '@/components/landing/sections/Pricing'
import IntegrationsMarquee from '@/components/landing/sections/IntegrationsMarquee'
import Testimonials from '@/components/landing/sections/Testimonials'
import FinalCTA from '@/components/landing/sections/FinalCTA'
import Footer from '@/components/landing/sections/Footer'
import About from '@/components/landing/sections/About'
import Values from '@/components/landing/sections/Values'


// ── ScrollSmoother est un plugin GSAP Club (payant)
// ── Si tu ne l'as pas, remplace par ScrollTrigger seul
let ScrollSmoother: any = null
try {
  ScrollSmoother = require('gsap/ScrollSmoother').ScrollSmoother
  gsap.registerPlugin(ScrollSmoother)
} catch {
  // ScrollSmoother non disponible — dégradation gracieuse
}

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function LandingPage() {
//   const wrapperRef = useRef<HTMLDivElement>(null)
//   const contentRef = useRef<HTMLDivElement>(null)

//   useGSAP(() => {
//     // ScrollSmoother — seulement si disponible ET desktop
//     if (ScrollSmoother && window.innerWidth > 768) {
//       ScrollSmoother.create({
//         wrapper:         wrapperRef.current!,
//         content:         contentRef.current!,
//         smooth:          1,
//         effects:         true,
//         smoothTouch:     0.1,
//         normalizeScroll: true,
//       })
//     }

//     // Animation CTA au scroll
//     gsap.to('#cta', {
//       scale: 1.1,
//       duration: 2,
//       scrollTrigger: {
//         trigger: '#cta',
//         start:   'top 85%',
//         end:     'top 35%',
//         scrub:   true,
//       },
//     })

//   }, { scope: wrapperRef })

  return (
    <div  id="smooth-wrapper">
      <div id="smooth-content">
        <div className="min-h-screen bg-background font-body text-foreground overflow-hidden">
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
      </div>
    </div>
  )
}