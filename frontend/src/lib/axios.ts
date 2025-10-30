import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'

export const API_CONFIG = {
  //BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'https://www.keciyibesle.com/api',
  BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5294/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: '/Auth',
    USERS: '/User',
    ROLES: '/User/roles',
    USER_ROLES: '/User/user-role',
    PODCASTS: '/Podcast',
    QUESTIONS: '/Podcast/questions',
    ANSWERS: '/Podcast/answers',
    NOTES: '/Podcast/notes',
    FAVORITES: '/Podcast/favorites',
    WEEKLY: '/Weekly',
    USER_SERIES_ACCESS: '/Podcast/userseriesaccess',
    USER_WEEKLY_ASSIGNMENT: '/Weekly/userweeklyassignment',
    CONTENT: '/Content',
  },
} as const

// Configure global axios defaults so any direct axios calls (if present) also hit the API, not 5173
axios.defaults.baseURL = API_CONFIG.BASE_URL
axios.defaults.timeout = API_CONFIG.TIMEOUT
axios.defaults.headers.common['Content-Type'] = 'application/json'

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken')
        window.location.href = '/auth/sign-in'
      }
      return Promise.reject(error)
    },
  )

  return instance
}

export const apiClient = createAxiosInstance()

export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.request<T>(config)
  return response.data as T
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => apiRequest<T>({ method: 'GET', url, ...config }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiRequest<T>({ method: 'POST', url, data, ...config }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiRequest<T>({ method: 'PUT', url, data, ...config }),
  delete: <T>(url: string, config?: AxiosRequestConfig) => apiRequest<T>({ method: 'DELETE', url, ...config }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiRequest<T>({ method: 'PATCH', url, data, ...config }),
}


