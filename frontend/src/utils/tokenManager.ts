/**
 * Token management utilities
 * Handles token expiration, inactivity tracking, and automatic cleanup
 */

const TOKEN_KEY = 'authToken'
const LAST_ACTIVITY_KEY = 'lastActivity'
const INACTIVITY_THRESHOLD_DAYS = 2 // 2 days of inactivity

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
 * Remove token and last activity
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(LAST_ACTIVITY_KEY)
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
 * Check if token is expired based on inactivity (2 days)
 */
export function isTokenInactive(): boolean {
  const lastActivity = getLastActivity()
  if (!lastActivity) return true

  const rememberMe = localStorage.getItem('rememberMe') === 'true'
  const threshold = rememberMe ? 30 : INACTIVITY_THRESHOLD_DAYS

  const now = new Date()
  const daysSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)

  return daysSinceLastActivity >= threshold
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
      removeToken()
      return false
    }
  } catch (error) {
    // If token is malformed, remove it
    removeToken()
    return false
  }

  return true
}

/**
 * Initialize token manager - should be called on app startup
 */
export function initializeTokenManager(): void {
  // Check token validity on app load
  if (!isTokenValid()) {
    // Token is invalid or inactive, clear it
    removeToken()
  } else {
    // Token is valid, update last activity
    updateLastActivity()
  }
}

