'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faTimes, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useDarkMode } from '@/hooks/useDarkMode'
import { Logo } from '@/components/ui/Logo'

const navLinks = [
  { label: 'Comment ça marche', href: '/#how-it-works' },
  { label: 'Fonctionnalités',   href: '/#features' },
  { label: 'Tarifs',            href: '/#pricing' },
  { label: 'Intégrations',      href: '/#integrations' },
  { label: 'À propos',          href: '/#about' },
  { label: 'Valeurs',          href: '/#values' },
]

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { dark, toggle } = useDarkMode()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 will-change-transform uppercase h-max ${
      isScrolled
        ? 'bg-background/90 backdrop-blur-md border-b border-border py-3'
        : 'bg-transparent py-5'
    }`}>
      <div className="relative max-w-full h-max mx-auto px-6 flex items-center justify-between">

        <Logo priority />

        <div className="hidden lg:flex items-center gap-2">
          {navLinks.map(item => (
            <a
              key={item.label}
              href={item.href}
              className="px-4 py-2 text-xs text-muted-foreground font-bold hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="text-muted-foreground hover:bg-accent"
            aria-label="Basculer le thème"
          >
            {dark
              ? <FontAwesomeIcon icon={faSun} className="w-4.5 h-4.5" />
              : <FontAwesomeIcon icon={faMoon} className="w-4.5 h-4.5" />
            }
          </Button>

          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="sm"
              onClick={() => router.push('/login')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all"
            >
              Démarrer gratuitement
            </Button>
          </motion.div>
        </div>

        <div className="flex md:hidden items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="text-muted-foreground hover:bg-accent"
            aria-label="Basculer le thème"
          >
            {dark
              ? <FontAwesomeIcon icon={faSun} className="w-4.5 h-4.5" />
              : <FontAwesomeIcon icon={faMoon} className="w-4.5 h-4.5" />
            }
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(v => !v)}
            className="text-muted-foreground hover:bg-accent"
            aria-label="Menu"
          >
            {mobileOpen ? <FontAwesomeIcon icon={faTimes} className="w-5 h-5" /> : <FontAwesomeIcon icon={faEllipsisH} className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="md:hidden bg-background border-b border-border px-6 pb-5 pt-2"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map(item => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-accent transition-colors"
              >
                {item.label}
              </a>
            ))}

            <div className="h-px bg-border my-2" />

            <button
              onClick={() => { router.push('/login'); setMobileOpen(false) }}
              className="text-sm text-muted-foreground py-2.5 px-3 text-left rounded-lg hover:bg-accent transition-colors"
            >
              Connexion
            </button>

            <Button
              onClick={() => { router.push('/login'); setMobileOpen(false) }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full mt-1"
            >
              Démarrer gratuitement
            </Button>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
