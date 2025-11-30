import { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import trTranslations from './locales/tr.json'

type TranslationKey = string
type TranslationParams = Record<string, string | number>

interface I18nContextType {
  t: (key: TranslationKey, params?: TranslationParams) => string
  language: string
  setLanguage: (lang: string) => void
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Translation function to get nested keys
const getNestedValue = (obj: any, path: string): string => {
  const keys = path.split('.')
  let value = obj
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return path // Return key if not found
    }
  }
  return typeof value === 'string' ? value : path
}

// Replace placeholders in translation string
const replaceParams = (text: string, params?: TranslationParams): string => {
  if (!params) return text
  let result = text
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
  }
  return result
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<string>('tr')

  const translations = useMemo(() => {
    switch (language) {
      case 'tr':
        return trTranslations
      default:
        return trTranslations
    }
  }, [language])

  const t = (key: TranslationKey, params?: TranslationParams): string => {
    const translation = getNestedValue(translations, key)
    return replaceParams(translation, params)
  }

  const value = useMemo(
    () => ({
      t,
      language,
      setLanguage,
    }),
    [language, translations]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

