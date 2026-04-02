'use client'

import { createContext, useCallback, useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import { User } from '@/lib/api/types'

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  googleLogin: (token: string) => Promise<void>
  setUserFromToken: (token: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Restaure la session au chargement si token présent
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('feosync_token')
      if (!token) { setIsLoading(false); return }
      try {
        const currentUser = await apiClient.getCurrentUser()
        setUser(currentUser)
      } catch {
        apiClient.clearToken()
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
      // Appelle POST /api/v1/auth/google/auth
      // Stocke access_token dans localStorage automatiquement via apiClient.setToken()
      const response = await apiClient.googleLogin(googleToken)
      setUser(response.user)
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion Google')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setUserFromToken = useCallback(async (accessToken: string) => {
    apiClient.setToken(accessToken)
    try {
      const currentUser = await apiClient.getCurrentUser()
      setUser(currentUser)
    } catch {
      apiClient.clearToken()
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await apiClient.logout()
    } finally {
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      googleLogin,
      setUserFromToken,
      logout,
      error,
    }}>
      {children}
    </AuthContext.Provider>
  )
}