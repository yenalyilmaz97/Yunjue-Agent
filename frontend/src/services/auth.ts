import { api } from '@/lib/axios'
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/keci'

const AUTH_ENDPOINTS = {
  LOGIN: '/Auth/login',
  REGISTER: '/Auth/register',
  VALIDATE_TOKEN: '/Auth/validate-token',
} as const

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials)
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('userRoles', JSON.stringify(response.roles))
    }
    return response
  },
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, userData)
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('userRoles', JSON.stringify(response.roles))
    }
    return response
  },
  async validateToken(): Promise<AuthResponse> {
    return await api.post<AuthResponse>(AUTH_ENDPOINTS.VALIDATE_TOKEN)
  },
  logout(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userRoles')
  },
}

export default authService


