"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe, Menu, X } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import type { Language } from "@/lib/translations"
import { useUser, SignInButton, SignOutButton, SignedOut } from '@clerk/nextjs';


const languages = [
  { code: "en" as Language, name: "English", flag: "🇺🇸" },
  { code: "es" as Language, name: "Español", flag: "🇪🇸" },
  { code: "ar" as Language, name: "العربية", flag: "🇸🇦" },
  { code: "fr" as Language, name: "Français", flag: "🇫🇷" },
  { code: "zh" as Language, name: "中文", flag: "🇨🇳" },
  { code: "ru" as Language, name: "Русский", flag: "🇷🇺" },
  { code: "hi" as Language, name: "हिन्दी", flag: "🇮🇳" },
  { code: "pt" as Language, name: "Português", flag: "🇧🇷" },
  { code: "de" as Language, name: "Deutsch", flag: "🇩🇪" },
  { code: "id" as Language, name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "tr" as Language, name: "Türkçe", flag: "🇹🇷" },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language, t, setLanguage } = useTranslation()
  const { isSignedIn } = useUser();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-playfair text-xl font-bold text-foreground">DiploMaker</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-16 ml-31">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("home")}
            </Link>
            <Link href="/editor" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("editor")}
            </Link>
            <Link href="/templates" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("templates")}
            </Link>
          </div>

          {/* Language Selector & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">{languages.find((l) => l.code === language)?.flag}</span>
                    <span className="text-sm hidden sm:inline">{languages.find((l) => l.code === language)?.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center space-x-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {!isSignedIn ?
              <div className="
                    px-3 py-1 
                      border-2 border-green-500 
                     text-green-500 
                    rounded-lg 
                   hover:bg-green-500 hover:text-white 
                     transition-colors duration-300
                      focus:outline-none focus:ring-2 focus:ring-green-300
                        ">
                <SignInButton />
              </div>
              :
              <div className="
                    px-3 py-1 
                    border-2 border-red-500 
                  text-red-500 
                    rounded-lg 
                  hover:bg-red-500 hover:text-white 
                    transition-colors duration-300
                     focus:outline-none focus:ring-2 focus:ring-red-300
                    ">
                <SignOutButton />
              </div>
            }

          </div>

        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("home")}
              </Link>
              <Link
                href="/editor"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("editor")}
              </Link>
              <Link
                href="/templates"
                className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("templates")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
