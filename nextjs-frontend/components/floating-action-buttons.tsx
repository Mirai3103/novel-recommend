"use client"

import { useState, useEffect } from "react"
import { ArrowUp, Settings, List } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FloatingActionButtonsProps {
  onSettingsClick: () => void
  progress: number
}

export function FloatingActionButtons({ onSettingsClick, progress }: FloatingActionButtonsProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
      {/* Progress Indicator */}
      <div className="relative">
        <svg className="w-14 h-14 -rotate-90">
          <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="3" fill="none" className="text-muted" />
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-purple-500"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Settings Button */}
      <Button
        size="icon"
        className="w-14 h-14 rounded-full shadow-lg bg-background hover:bg-accent"
        variant="outline"
        onClick={onSettingsClick}
      >
        <Settings className="w-5 h-5" />
      </Button>

      {/* TOC Button (Mobile) */}
      <Button
        size="icon"
        className="w-14 h-14 rounded-full shadow-lg bg-background hover:bg-accent md:hidden"
        variant="outline"
      >
        <List className="w-5 h-5" />
      </Button>

      {/* Scroll to Top */}
      <Button
        size="icon"
        className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        onClick={scrollToTop}
      >
        <ArrowUp className="w-5 h-5" />
      </Button>
    </div>
  )
}
