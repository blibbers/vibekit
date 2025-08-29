import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { authApi, User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const isCheckingRef = useRef(false)

  const checkAuthStatus = async () => {
    // Prevent multiple simultaneous calls
    if (isCheckingRef.current) return
    
    isCheckingRef.current = true
    
    try {
      const { user } = await authApi.getCurrentUser()
      setUser(user)
    } catch (error: any) {
      // Only set user to null if it's actually a 401, not a network error
      if (error?.response?.status === 401) {
        setUser(null)
      }
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
      isCheckingRef.current = false
    }
  }

  useEffect(() => {
    if (!isInitialized) {
      checkAuthStatus()
    }
  }, [isInitialized])

  const refreshUser = async () => {
    try {
      const { user } = await authApi.getCurrentUser()
      setUser(user)
    } catch (error) {
      setUser(null)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { user } = await authApi.login({ email, password })
      setUser(user)
      
      // Refresh user data to ensure we have the latest info
      await refreshUser()
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { user } = await authApi.register({ email, password, firstName, lastName })
      setUser(user)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
      setUser(null)
    } catch (error) {
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}