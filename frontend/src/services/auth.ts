import { api } from '@/lib/axios'
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/keci'
import { saveToken, removeToken, updateLastActivity, isTokenValid } from '@/utils/tokenManager'

const AUTH_ENDPOINTS = {
  LOGIN: '/Auth/login',
  REGISTER: '/Auth/register',
  VALIDATE_TOKEN: '/Auth/validate-token',
  CHECK_DAILY_CONTENT: '/Auth/check-daily-content',
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
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('userRoles', JSON.stringify(response.roles))
    }
    return response
  },
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, userData)
    if (response.success && response.token && response.user) {
      saveToken(response.token)
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
  logout(): void {
    removeToken()
    localStorage.removeItem('user')
    localStorage.removeItem('userRoles')
  },
}

export default authService


