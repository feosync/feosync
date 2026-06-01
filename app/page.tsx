'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/spinner'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/overview')
      }
      // Si pas authentifié → reste sur / → affiche la landing
    }
  }, [isAuthenticated, isLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  // Pas authentifié → affiche la landing
  if (!isAuthenticated) {
    return <LandingPage />
  }

  // Authentifié → en cours de redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="h-12 w-12" />
    </div>
  )
}

// Import lazy pour ne pas charger GSAP si on est déjà connecté
import dynamic from 'next/dynamic'
const LandingPage = dynamic(() => import('@/components/landing/LandingPage'), { ssr: false })