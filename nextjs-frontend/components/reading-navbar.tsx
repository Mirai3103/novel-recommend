"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Settings, Bookmark, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ReadingNavbarProps {
  novelId: string
  novelTitle: string
  chapterTitle: string
  chapterOrder: number
  onSettingsClick: () => void
}

export function ReadingNavbar({
  novelId,
  novelTitle,
  chapterTitle,
  chapterOrder,
  onSettingsClick,
}: ReadingNavbarProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        // Scrolling up or at top
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link href={`/novel/${novelId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-muted-foreground truncate">{novelTitle}</div>
          </div>
        </div>

        {/* Center */}
        <div className="hidden md:block text-center flex-1">
          <div className="font-semibold truncate">{chapterTitle}</div>
          <div className="text-xs text-muted-foreground">Chapter {chapterOrder}</div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button variant="ghost" size="icon" onClick={onSettingsClick}>
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bookmark className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
