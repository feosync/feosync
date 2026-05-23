'use client'

import { useState } from 'react'
import { faGear, faUser, faBell, faInfo, faShield, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import { SettingsSidebar, SettingsMobileTabs, NavItem } from '@/components/settings/SettingsSidebar'
import { GeneralSection }       from '@/components/settings/sections/GeneralSection'
import { ProfileSection }       from '@/components/settings/sections/ProfileSection'
import { NotificationsSection } from '@/components/settings/sections/NotificationsSection'
import { AccountSection }       from '@/components/settings/sections/AccountSection'
import { AboutSection }         from '@/components/settings/sections/AboutSection'
import { AiSection } from '@/components/settings/sections/AiSection'



/* ── Nav config ────────────────────────────────────────────────── */

const NAV_ITEMS: NavItem[] = [
  { id: 'general',       label: 'Général',       icon: faGear },
  { id: 'profile',       label: 'Profil',        icon: faUser },
  { id: 'notifications', label: 'Notifications', icon: faBell },
  { id: 'ai',            label: 'IA & Quota',    icon: faWandMagicSparkles },
  { id: 'account',       label: 'Compte',        icon: faShield },
  { id: 'about',         label: 'À propos',      icon: faInfo },
]

const SECTION_TITLES: Record<string, { title: string; description: string }> = {
  general:       { title: 'Général',       description: "Apparence et préférences de l'application" },
  profile:       { title: 'Profil',        description: 'Informations personnelles et photo' },
  notifications: { title: 'Notifications', description: 'Gérez comment vous êtes alerté' },
  ai:            { title: 'IA & Quota',    description: "Suivi de l'utilisation de l'intelligence artificielle" },
  account:       { title: 'Compte',        description: 'Sécurité et gestion du compte' },
  about:         { title: 'À propos',      description: 'Informations sur FeoSync' },
}

function SectionContent({ activeId }: { activeId: string }) {
  switch (activeId) {
    case 'general':       return <GeneralSection />
    case 'profile':       return <ProfileSection />
    case 'notifications': return <NotificationsSection />
    case 'ai':            return <AiSection />
    case 'account':       return <AccountSection />
    case 'about':         return <AboutSection />
    default:              return null
  }
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const [activeId, setActiveId] = useState('general')
  const meta = SECTION_TITLES[activeId]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Paramètres</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gérez votre compte et vos préférences
          </p>
        </div>

        <div className="flex gap-6">

          {/* ── Sidebar (desktop) ─────────────────────────────── */}
          <aside className="hidden md:block w-52 shrink-0">
            <div className="sticky top-6">
              <SettingsSidebar
                items={NAV_ITEMS}
                activeId={activeId}
                onSelect={setActiveId}
              />
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* Mobile tabs */}
            <div className="md:hidden mb-5">
              <SettingsMobileTabs
                items={NAV_ITEMS}
                activeId={activeId}
                onSelect={setActiveId}
              />
            </div>

            {/* Section title */}
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {meta.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {meta.description}
              </p>
            </div>

            {/* Section content */}
            <SectionContent activeId={activeId} />
          </main>

        </div>
      </div>
    </div>
  )
}