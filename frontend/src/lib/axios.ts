import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'

export const API_CONFIG = {
  //BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'https://app.keciyibesle.com/api',
  BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5294/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: '/Auth',
    USERS: '/User',
    ROLES: '/Role',
    ANSWERS: '/Answers',
    QUESTIONS: '/Questions',
    NOTES: '/Notes',
    FAVORITES: '/Favorites',
    WEEKLY: '/Weekly',
    WEEKLY_QUESTION: '/WeeklyQuestion',
    WEEKLY_QUESTION_ANSWER: '/WeeklyQuestionAnswer',
    USER_SERIES_ACCESS: '/UserSeriesAccess',
    USER_WEEKLY_ASSIGNMENT: '/Weekly', // Weekly assignments are handled by Weekly controller
    SERIES: '/Series',
    EPISODES: '/Episodes',
    MUSIC: '/Music',
    MOVIES: '/Movies',
    TASKS: '/Tasks',
    AFFIRMATION: '/Affirmation',
    APHORISMS: '/Aphorisms',
    ARTICLE: '/Article',
    DAILY_CONTENT: '/DailyContent',
    USER_PROGRESS: '/UserProgress',
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
      // If data is FormData, remove Content-Type to let browser set it with boundary
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Don't redirect if already on login page
        const isLoginPage = window.location.pathname.includes('/auth/sign-in')
        if (!isLoginPage) {
          localStorage.removeItem('authToken')
          window.location.href = '/auth/sign-in'
        }
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


