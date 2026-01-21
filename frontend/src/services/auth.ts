import { api } from '@/lib/axios'
import type { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest, RefreshTokenResponse } from '@/types/keci'
import { saveToken, removeToken, updateLastActivity, isTokenValid, saveRefreshToken, getRefreshToken } from '@/utils/tokenManager'

const AUTH_ENDPOINTS = {
  LOGIN: '/Auth/login',
  REGISTER: '/Auth/register',
  VALIDATE_TOKEN: '/Auth/validate-token',
  CHECK_DAILY_CONTENT: '/Auth/check-daily-content',
  REFRESH_TOKEN: '/Auth/refresh-token',
  REVOKE_TOKEN: '/Auth/revoke-token',
} as const

export const authService = {
  async checkDailyContent(): Promise<void> {
    const isValid = isTokenValid()
    if (isValid) {
      try {
        await api.post(AUTH_ENDPOINTS.CHECK_DAILY_CONTENT)
        console.log('Daily content check successful')
      } catch (error) {
        console.error('Error checking daily content:', error)
      }
    } else {
      console.warn('Token invalid, skipping daily content check')
    }
  },

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials)
    if (response.success && response.token && response.user) {
      saveToken(response.token)
      // Save refresh token if provided
      if (response.refreshToken) {
        saveRefreshToken(response.refreshToken, response.refreshTokenExpiration)
      }
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('userRoles', JSON.stringify(response.roles))
      // Store rememberMe preference
      if (credentials.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }
    }
    return response
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, userData)
    if (response.success && response.token && response.user) {
      saveToken(response.token)
      // Save refresh token if provided
      if (response.refreshToken) {
        saveRefreshToken(response.refreshToken, response.refreshTokenExpiration)
      }
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('userRoles', JSON.stringify(response.roles))
    }
    return response
  },

  async validateToken(): Promise<AuthResponse> {
    // Check if token is valid before making request
    if (!isTokenValid()) {
      return {
        success: false,
        message: 'Token is invalid or inactive',
        token: '',
        user: undefined,
        roles: [],
      }
    }

    const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.VALIDATE_TOKEN)
    if (response.success) {
      updateLastActivity()
    }
    return response
  },

  async refreshToken(): Promise<RefreshTokenResponse | null> {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      return null
    }

    try {
      const response = await api.post<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH_TOKEN, {
        refreshToken,
      } as RefreshTokenRequest)

      if (response.success && response.token) {
        saveToken(response.token)
        if (response.refreshToken) {
          saveRefreshToken(response.refreshToken, response.refreshTokenExpiration)
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user))
        }
        if (response.roles) {
          localStorage.setItem('userRoles', JSON.stringify(response.roles))
        }
      }

      return response
    } catch (error) {
      console.error('Error refreshing token:', error)
      return null
    }
  },

  async revokeToken(): Promise<boolean> {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      return false
    }

    try {
      await api.post(AUTH_ENDPOINTS.REVOKE_TOKEN, { refreshToken })
      return true
    } catch (error) {
      console.error('Error revoking token:', error)
      return false
    }
  },

  logout(): void {
    // Try to revoke the refresh token on the server (fire and forget)
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      // Don't await - just try to revoke
      api.post(AUTH_ENDPOINTS.REVOKE_TOKEN, { refreshToken }).catch(() => {
        // Ignore errors during logout revocation
      })
    }
    removeToken()
    localStorage.removeItem('user')
    localStorage.removeItem('userRoles')
  },
}

export default authService
