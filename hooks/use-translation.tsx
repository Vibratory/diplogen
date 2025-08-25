"use client"

import { useContext, createContext, type ReactNode } from "react"
import { type Language, type TranslationKey, getTranslation } from "@/lib/translations"

interface TranslationContextType {
  language: Language
  t: (key: TranslationKey) => string
  setLanguage: (language: Language) => void
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}

export function TranslationProvider({
  children,
  language,
  onLanguageChange,
}: {
  children: ReactNode
  language: Language
  onLanguageChange: (language: Language) => void
}) {
  const t = (key: TranslationKey) => getTranslation(language, key)

  return (
    <TranslationContext.Provider value={{ language, t, setLanguage: onLanguageChange }}>
      {children}
    </TranslationContext.Provider>
  )
}
