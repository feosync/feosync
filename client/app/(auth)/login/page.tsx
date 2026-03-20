'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Sparkles, BarChart2, Calendar, Zap } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'

const features = [
  { icon: Calendar,  text: 'Planifiez vos posts à l\'avance' },
  { icon: Sparkles,  text: 'Générez du contenu avec l\'IA' },
  { icon: BarChart2, text: 'Analysez vos performances' },
  { icon: Zap,       text: 'Publiez sur toutes vos pages' },
]

export default function LoginPage() {
  
  const { error } = useAuth()

  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleGoogleLogin = () => {
    setLoading(true)
    const params = new URLSearchParams({
      client_id:     process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      response_type: 'code',
      scope:         'openid email profile',
      access_type:   'offline',
      prompt:        'select_account',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-16">

        {/* ── Gauche — visuel ── */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col justify-between p-12">

          {/* Pattern de fond */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Blobs décoratifs */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />

          {/* Contenu gauche */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-white font-semibold text-xl">FeoSync</span>
            </div>

            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Gérez vos réseaux sociaux{' '}
              <span className="text-blue-200">intelligemment</span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-md">
              Automatisez, planifiez et analysez vos publications Facebook avec l'aide de l'IA.
            </p>
          </div>

          {/* Features */}
          <div className="relative space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-100 text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <p className="text-white/90 text-sm leading-relaxed italic">
              "FeoSync a transformé notre stratégie social media. On publie 3x plus et nos stats sont au top."
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center text-white text-xs font-bold">
                MR
              </div>
              <div>
                <p className="text-white text-xs font-medium">Marie Rakoto</p>
                <p className="text-blue-200 text-[11px]">Responsable marketing · Tana</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Droite — formulaire ── */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">

            {/* Logo mobile */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-semibold text-[18px] text-slate-900 dark:text-white">FeoSync</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                Bon retour 👋
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Connectez-vous pour accéder à votre espace FeoSync
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Google button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 h-12 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-medium transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )}
              {loading ? 'Redirection vers Google...' : 'Continuer avec Google'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Connexion sécurisée</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { label: 'SSL chiffré',  icon: '🔒' },
                { label: 'RGPD conforme',icon: '🇪🇺' },
                { label: 'OAuth Google', icon: '✓' },
              ].map(b => (
                <div
                  key={b.label}
                  className="flex flex-col items-center gap-1 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <span className="text-base">{b.icon}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-tight">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
              En continuant, vous acceptez nos{' '}
              <Link href="#cgu" className="underline hover:text-blue-600 transition-colors">
                conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link href="#confidentialite" className="underline hover:text-blue-600 transition-colors">
                politique de confidentialité
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}