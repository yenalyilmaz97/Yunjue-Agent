type CurrencyType = '₹' | '$' | '€'

export const currency: CurrencyType = '$'

export const currentYear = new Date().getFullYear()

export const developedByLink = ''

export const developedBy = ''

export const contactUs = ''

export const buyLink = ''

export const basePath = ''

export const DEFAULT_PAGE_TITLE = 'Keçiyi Besle'

// Replace the URL's value in env with your backend's URL or if you're using nextjs's API, add the server's origin URL
export const API_BASE_PATH = ''

export const colorVariants = ['primary', 'secondary', 'success', 'info', 'warning', 'dark', 'purple', 'pink', 'orange', 'light', 'link']

// Theme color constants (matching SCSS variables)
export const themeColors = {
  burgundy: '#8b1538',      // Elegant burgundy (primary)
  maroon: '#a02040',         // Rich maroon
  red: '#dc3545',            // Modern red
  darkRed900: '#5a0e0e',     // Darkest red
  darkRed800: '#6b1a1a',     // Dark red
  darkRed700: '#6b0f0f',     // Dark red
  darkRed600: '#7a1f1f',     // Medium dark red
  darkRed500: '#9b1e3d',     // Medium red
  green: '#17c553',          // Success green
} as const

// Content type icons
export const CONTENT_ICONS = {
  video: 'mingcute:video-line',
  audio: 'mingcute:headphone-line',
  pdf: 'mingcute:file-pdf-line',
  gallery: 'mingcute:pic-line',
  default: 'mingcute:file-line',
} as const