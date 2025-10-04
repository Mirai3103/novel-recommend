"use client"

import { ArrowUp, Settings, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useReadingSettings } from "./page-context"


export function FloatingActionButtons() {
  const { scrollProgress, isScrolled, setIsSettingsOpen } = useReadingSettings()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 flex flex-col gap-3 z-40 transition-all duration-300 ${
        isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{ transform: 'translateZ(0)', willChange: 'opacity, transform' }}
    >
      {/* Progress Indicator */}
      <div className="relative">
        <svg className="w-14 h-14 -rotate-90" style={{ transform: 'translateZ(0)' }}>
          <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="3" fill="none" className="text-muted/50" />
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-purple-500 transition-all duration-150"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1 - scrollProgress / 100)}`}
            strokeLinecap="round"
            style={{ willChange: 'stroke-dashoffset' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
          {Math.round(scrollProgress)}%
        </div>
      </div>

      {/* Settings Button */}
      <Button
        size="icon"
        className="w-14 h-14 rounded-full shadow-lg bg-background hover:bg-accent"
        variant="outline"
        onClick={() => setIsSettingsOpen(true)}
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
