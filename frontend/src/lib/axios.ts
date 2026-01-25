import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import {
  getToken,
  saveToken,
  removeToken,
  getRefreshToken,
  saveRefreshToken,
  isRefreshTokenValid,
  updateLastActivity,
} from '@/utils/tokenManager'

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

// Track if we're currently refreshing
let isRefreshing = false
// Queue of requests waiting for token refresh
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
  config: InternalAxiosRequestConfig
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.config.headers.Authorization = `Bearer ${token}`
      prom.resolve(apiClient.request(prom.config))
    }
  })
  failedQueue = []
}

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
      const token = getToken()
      if (token && config.headers) {
        // Check if we should proactively refresh (token about to expire)
        // This is handled by response interceptor now
        config.headers.Authorization = `Bearer ${token}`
        // Update last activity on each request
        updateLastActivity()
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
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

      // If the error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Check if we're on the login page or refresh endpoint
        const isLoginPage = window.location.pathname.includes('/auth/sign-in')
        const isRefreshEndpoint = originalRequest.url?.includes('/Auth/refresh-token')

        if (isLoginPage || isRefreshEndpoint) {
          return Promise.reject(error)
        }

        // Check if we have a valid refresh token
        if (!isRefreshTokenValid()) {
          removeToken()
          window.location.href = '/auth/sign-in'
          return Promise.reject(error)
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshToken = getRefreshToken()
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}/Auth/refresh-token`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          )

          if (response.data.success) {
            const { token, refreshToken: newRefreshToken, refreshTokenExpiration } = response.data

            // Save new tokens
            saveToken(token)
            saveRefreshToken(newRefreshToken, refreshTokenExpiration)

            // Update user info if provided
            if (response.data.user) {
              localStorage.setItem('user', JSON.stringify(response.data.user))
            }
            if (response.data.roles) {
              localStorage.setItem('userRoles', JSON.stringify(response.data.roles))
            }

            // Process queued requests with new token
            processQueue(null, token)

            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${token}`
            return instance.request(originalRequest)
          } else {
            throw new Error('Refresh failed')
          }
        } catch (refreshError) {
          processQueue(refreshError, null)
          removeToken()
          localStorage.removeItem('user')
          localStorage.removeItem('userRoles')
          window.location.href = '/auth/sign-in'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
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
  // Post with progress tracking
  postWithProgress: <T>(url: string, data?: unknown, onProgress?: (progress: number) => void, config?: AxiosRequestConfig) => {
    return apiClient.post<T>(url, data, {
      ...config,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentCompleted)
        }
      },
    }).then(response => response.data as T)
  },
  // Put with progress tracking
  putWithProgress: <T>(url: string, data?: unknown, onProgress?: (progress: number) => void, config?: AxiosRequestConfig) => {
    return apiClient.put<T>(url, data, {
      ...config,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentCompleted)
        }
      },
    }).then(response => response.data as T)
  },
}
