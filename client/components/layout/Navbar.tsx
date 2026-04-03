'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Menu, X, Moon, Sun } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useDarkMode } from '@/hooks/useDarkMode'

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
  const { dark, toggle } = useDarkMode()   // ← destructure les deux
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3'
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        <div  className="w-56 h-16 relative">
          <Image src={dark ? '/images/dark/feosync_logo.png' : '/images/light/feosync_logo.png'} alt="FeoSync" width={32} height={32} className="w-full h-full" />
        </div>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(item => (
            <a
              key={item.label}
              href={item.href}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
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
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            aria-label="Basculer le thème"
          >
            {dark
              ? <Sun className="w-4.5 h-4.5 text-white" />
              : <Moon className="w-4.5 h-4.5 text-slate-800" />
            }
          </Button>

          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="sm"
              onClick={() => router.push('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 shadow-sm hover:shadow-md hover:shadow-blue-500/20 transition-all"
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
            className="text-slate-600 dark:text-slate-400"
            aria-label="Basculer le thème"
          >
            {dark
              ? <Sun className="w-4.5 h-4.5 text-white" />
              : <Moon className="w-4.5 h-4.5 text-slate-800" />
            }
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(v => !v)}
            className="text-slate-600 dark:text-slate-400"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 pb-5 pt-2"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map(item => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {item.label}
              </a>
            ))}

            <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

            <button
              onClick={() => { router.push('/login'); setMobileOpen(false) }}
              className="text-sm text-slate-600 dark:text-slate-400 py-2.5 px-3 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Connexion
            </button>

            <Button
              onClick={() => { router.push('/login'); setMobileOpen(false) }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full mt-1"
            >
              Démarrer gratuitement
            </Button>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
