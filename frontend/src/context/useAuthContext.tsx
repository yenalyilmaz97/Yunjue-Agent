import type { UserType } from '@/types/auth'
import { deleteCookie, getCookie, hasCookie, setCookie } from 'cookies-next'
import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChildrenType } from '../types/component-props'
import { initializeTokenManager, shouldLogout, removeToken } from '@/utils/tokenManager'

export type AuthContextType = {
  user: UserType | undefined
  isAuthenticated: any
  saveSession: (session: UserType, rememberMe?: boolean) => void
  removeSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

const authSessionKey = '_DARKONE_AUTH_KEY_'

export function AuthProvider({ children }: ChildrenType) {
  const navigate = useNavigate()

  const getSession = (): AuthContextType['user'] => {
    const fetchedCookie = getCookie(authSessionKey)?.toString()
    if (!fetchedCookie) return
    else return JSON.parse(fetchedCookie)
  }

  const [user, setUser] = useState<UserType | undefined>(getSession())

  // Initialize token manager on app load
  useEffect(() => {
    initializeTokenManager()

    // Check if user should be logged out periodically (every 5 minutes)
    // Only logs out if BOTH access and refresh tokens are invalid
    const interval = setInterval(() => {
      if (shouldLogout()) {
        // Both tokens are invalid or user is inactive, clear session
        removeToken()
        deleteCookie(authSessionKey)
        setUser(undefined)
        if (!window.location.pathname.includes('/auth/sign-in')) {
          navigate('/auth/sign-in')
        }
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [navigate])

  // Sync token from cookie to localStorage if missing
  useEffect(() => {
    if (user && (user as any).token && !localStorage.getItem('authToken')) {
      localStorage.setItem('authToken', (user as any).token)
      // If we have a user from cookie but no token in localStorage, it means we probably started a new session
      // with a persistent cookie. We should treat this as a "Remember Me" session.
      localStorage.setItem('rememberMe', 'true')
    }
  }, [user])

  // Check daily content on auth state change (login or initial load if authenticated)
  useEffect(() => {
    const checkDaily = async () => {
      if (hasCookie(authSessionKey) && user) {
        try {
          const { authService } = await import('@/services')
          await authService.checkDailyContent()
        } catch (error) {
          console.error('Failed to check daily content check', error)
        }
      }
    }

    if (user) {
      checkDaily()
    }
  }, [user])

  const saveSession = (user: UserType, rememberMe: boolean = false) => {
    const cookieOptions = rememberMe ? { maxAge: 30 * 24 * 60 * 60 } : undefined // 30 days if remember me
    setCookie(authSessionKey, JSON.stringify(user), cookieOptions)
    setUser(user)
    if ((user as any)?.token) {
      localStorage.setItem('authToken', (user as any).token)
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }
    }
  }

  const removeSession = () => {
    deleteCookie(authSessionKey)
    setUser(undefined)
    removeToken()
    navigate('/auth/sign-in')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: hasCookie(authSessionKey),
        saveSession,
        removeSession,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
