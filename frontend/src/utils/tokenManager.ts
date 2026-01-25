/**
 * Token management utilities
 * Handles token expiration, inactivity tracking, and automatic cleanup
 */

const TOKEN_KEY = 'authToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const REFRESH_TOKEN_EXPIRATION_KEY = 'refreshTokenExpiration'
const LAST_ACTIVITY_KEY = 'lastActivity'
const REMEMBER_ME_KEY = 'rememberMe'
const INACTIVITY_THRESHOLD_DAYS = 1 // 1 day of inactivity (30 days with remember me)

/**
 * Get token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Save token and update last activity
 */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  updateLastActivity()
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Save refresh token and its expiration
 */
export function saveRefreshToken(refreshToken: string, expiration?: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  if (expiration) {
    localStorage.setItem(REFRESH_TOKEN_EXPIRATION_KEY, expiration)
  }
}

/**
 * Remove refresh token
 */
export function removeRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_EXPIRATION_KEY)
}

/**
 * Check if refresh token is valid (not expired)
 */
export function isRefreshTokenValid(): boolean {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  const expiration = localStorage.getItem(REFRESH_TOKEN_EXPIRATION_KEY)
  if (!expiration) return false

  const expirationDate = new Date(expiration)
  return expirationDate > new Date()
}

/**
 * Remove token, refresh token, and last activity
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(LAST_ACTIVITY_KEY)
  localStorage.removeItem(REMEMBER_ME_KEY)
  removeRefreshToken()
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(): void {
  localStorage.setItem(LAST_ACTIVITY_KEY, new Date().toISOString())
}

/**
 * Get last activity timestamp
 */
export function getLastActivity(): Date | null {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
  if (!lastActivity) return null
  return new Date(lastActivity)
}

/**
 * Check if token is expired based on inactivity (2 days or 30 days with remember me)
 */
export function isTokenInactive(): boolean {
  const lastActivity = getLastActivity()
  if (!lastActivity) return true

  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true'
  const threshold = rememberMe ? 30 : INACTIVITY_THRESHOLD_DAYS

  const now = new Date()
  const daysSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)

  return daysSinceLastActivity >= threshold
}

/**
 * Check if access token is expired by decoding JWT
 */
export function isAccessTokenExpired(): boolean {
  const token = getToken()
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds
    // Add 30 seconds buffer before actual expiration to refresh proactively
    return Date.now() >= exp - 30000
  } catch {
    return true
  }
}

/**
 * Check if token exists and is still active
 */
export function isTokenValid(): boolean {
  const token = getToken()
  if (!token) return false

  // Check inactivity
  if (isTokenInactive()) {
    removeToken()
    return false
  }

  // Check JWT expiration (basic check - decode and check exp claim)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds
    const now = Date.now()

    if (now >= exp) {
      // Access token expired, but we might have a valid refresh token
      if (isRefreshTokenValid()) {
        // Don't remove tokens, let axios interceptor handle refresh
        return false
      }
      removeToken()
      return false
    }
  } catch {
    // If token is malformed, remove it
    removeToken()
    return false
  }

  return true
}

/**
 * Check if user should be logged out
 * Returns true only if BOTH access token and refresh token are invalid
 * This allows axios interceptor to refresh the token before logging out
 */
export function shouldLogout(): boolean {
  // Check inactivity first (applies to both remember me and non-remember me)
  if (isTokenInactive()) {
    return true
  }

  // If refresh token is still valid, don't logout (axios will refresh access token)
  if (isRefreshTokenValid()) {
    return false
  }

  // Refresh token is invalid, check if access token is still valid
  const token = getToken()
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000
    // If access token is not expired, don't logout
    if (Date.now() < exp) {
      return false
    }
  } catch {
    // Malformed token
    return true
  }

  // Both tokens are invalid
  return true
}

/**
 * Initialize token manager - should be called on app startup
 */
export function initializeTokenManager(): void {
  // Check token validity on app load
  if (shouldLogout()) {
    // Both tokens are invalid or user is inactive, clear everything
    removeToken()
  } else if (isTokenValid()) {
    // Token is valid, update last activity
    updateLastActivity()
  }
  // If access token invalid but refresh token valid, axios interceptor will handle refresh
}
