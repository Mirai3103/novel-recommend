"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { ReadingSettings } from "@/lib/chapter-data"
import { defaultReadingSettings } from "@/lib/chapter-data"

interface ReadingSettingsContextType {
  settings: ReadingSettings
  updateSettings: (newSettings: Partial<ReadingSettings>) => void
  resetSettings: () => void
}

const ReadingSettingsContext = createContext<ReadingSettingsContextType | undefined>(undefined)

export function ReadingSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReadingSettings>(defaultReadingSettings)

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

  const updateSettings = (newSettings: Partial<ReadingSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(defaultReadingSettings)
  }

  return (
    <ReadingSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
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
