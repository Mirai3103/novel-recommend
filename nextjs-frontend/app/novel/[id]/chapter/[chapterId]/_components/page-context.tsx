"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { ReadingSettings } from "@/app/novel/[id]/chapter/[chapterId]/_components/chapter-data"
import { defaultReadingSettings } from "@/app/novel/[id]/chapter/[chapterId]/_components/chapter-data"

interface ReadingSettingsContextType {
  settings: ReadingSettings
  updateSettings: (newSettings: Partial<ReadingSettings>) => void
  resetSettings: () => void
  scrollProgress: number
  isScrolled: boolean
  isSettingsOpen: boolean
  setIsSettingsOpen: (isSettingsOpen: boolean) => void
}

const ReadingSettingsContext = createContext<ReadingSettingsContextType | undefined>(undefined)

export function ReadingSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReadingSettings>(defaultReadingSettings)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("reading-settings")
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse reading settings:", e)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("reading-settings", JSON.stringify(settings))
  }, [settings])

  // Centralized scroll handler with RAF throttling
 // Centralized scroll handler with debounce (1s delay after stop scrolling)
 const scrollRaf = useRef<number | null>(null)

 useEffect(() => {
   const updateScrollState = () => {
     const windowHeight = window.innerHeight
     const documentHeight = document.documentElement.scrollHeight
     const scrollTop = window.scrollY
     const maxScroll = documentHeight - windowHeight
 
     const newProgress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0
     const newIsScrolled = scrollTop > 50
 
     setScrollProgress(newProgress)
     setIsScrolled(newIsScrolled)
   }
 
   const handleScroll = () => {
     if (scrollRaf.current) {
       cancelAnimationFrame(scrollRaf.current)
     }
     scrollRaf.current = requestAnimationFrame(updateScrollState)
   }
 
   window.addEventListener("scroll", handleScroll, { passive: true })
   return () => {
     window.removeEventListener("scroll", handleScroll)
     if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current)
   }
 }, [])
 

  
  const updateSettings = (newSettings: Partial<ReadingSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(defaultReadingSettings)
  }

  return (
    <ReadingSettingsContext.Provider value={{ settings, updateSettings, resetSettings, scrollProgress, isScrolled, isSettingsOpen, setIsSettingsOpen }}>
      {children}
    </ReadingSettingsContext.Provider>
  )
}

export function useReadingSettings() {
  const context = useContext(ReadingSettingsContext)
  if (!context) {
    throw new Error("useReadingSettings must be used within ReadingSettingsProvider")
  }
  return context
}
