"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { TranslationProvider } from "@/hooks/use-translation"
import type { Language } from "@/lib/translations"

interface Props {
  children: React.ReactNode
}

export default function ClientLayout({ children }: Props) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && savedLanguage !== language) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    localStorage.setItem("language", language)
  }, [language])

  return (
    <TranslationProvider language={language} onLanguageChange={setLanguage}>
      <Navbar />
      {children}
    </TranslationProvider>
  )
}
