import type { UserType } from '@/types/auth'
import { deleteCookie, getCookie, hasCookie, setCookie } from 'cookies-next'
import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChildrenType } from '../types/component-props'
import { initializeTokenManager, isTokenValid, removeToken } from '@/utils/tokenManager'

export type AuthContextType = {
  user: UserType | undefined
  isAuthenticated: any
  saveSession: (session: UserType) => void
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
    
    // Check token validity periodically (every 5 minutes)
    const interval = setInterval(() => {
      if (!isTokenValid()) {
        // Token is invalid or inactive, clear session
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

  const saveSession = (user: UserType) => {
    setCookie(authSessionKey, JSON.stringify(user))
    setUser(user)
    if ((user as any)?.token) {
      localStorage.setItem('authToken', (user as any).token)
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
