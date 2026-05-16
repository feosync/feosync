'use client'

import { createContext, useCallback, useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import { User } from '@/lib/api/types'

export interface AuthContextType {
  user: User | null
  updateUser: (user: User) => void
  isLoading: boolean
  isAuthenticated: boolean
  googleLogin: (token: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
  // ← setUserFromToken supprimé : inutile avec les cookies
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Restaure la session au chargement
  useEffect(() => {
    const checkAuth = async () => {
      // ← plus de localStorage.getItem('feosync_token')
      // ← on essaie directement /auth/me
      // si le cookie est présent → succès
      // si le cookie est absent/expiré → 401 → catch
      try {
        const currentUser = await apiClient.getCurrentUser()
        setUser(currentUser)
      } catch {
        // ← plus de apiClient.clearToken()
        // le cookie est géré par le navigateur et le serveur
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const googleLogin = useCallback(async (googleToken: string) => {
    setIsLoading(true)
    setError(null)
    try {
      // ← apiClient.googleLogin() pose le cookie automatiquement via Set-Cookie
      // ← plus besoin de récupérer access_token
      const response = await apiClient.googleLogin(googleToken)
      setUser(response.user)
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion Google')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ← setUserFromToken supprimé complètement
  // Cette fonction servait à stocker un token manuellement
  // Avec les cookies, c'est le serveur qui pose le cookie → inutile

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await apiClient.logout()
      // ← apiClient.logout() appelle DELETE /auth/logout
      // le serveur supprime le cookie avec delete_cookie()
    } finally {
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      updateUser,
      isLoading,
      isAuthenticated: !!user,
      googleLogin,
      // ← setUserFromToken supprimé du context
      logout,
      error,
    }}>
      {children}
    </AuthContext.Provider>
  )
}