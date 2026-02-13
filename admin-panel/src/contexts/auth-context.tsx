import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '@/types/models'
import { authApi } from '@/api/auth'
import { setAccessToken } from '@/api/client'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string, totp_code?: string) => Promise<{ requires_2fa?: boolean }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.me()
      setUser(userData)
    } catch {
      setUser(null)
      setAccessToken(null)
    }
  }, [])

  // Try to restore session on mount
  useEffect(() => {
    const init = async () => {
      try {
        const { access_token } = await authApi.refresh()
        setAccessToken(access_token)
        await refreshUser()
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [refreshUser])

  const login = useCallback(async (username: string, password: string, totp_code?: string) => {
    try {
      const result = await authApi.login({ username, password, totp_code })
      setAccessToken(result.access_token)
      setUser(result.user)
      return {}
    } catch (err: unknown) {
      const error = err as { response?: { data?: { requires_2fa?: boolean; error?: { code?: string; message?: string } } } }
      if (error.response?.data?.requires_2fa) {
        return { requires_2fa: true }
      }
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setAccessToken(null)
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
