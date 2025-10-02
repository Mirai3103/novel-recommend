"use client"

import { useState, useEffect } from "react"
import { ReadingNavbar } from "@/components/reading-navbar"
import { ReadingSettingsPanel } from "@/components/reading-settings-panel"
import { ChapterContent } from "@/components/chapter-content"
import { ChapterNavigation } from "@/components/chapter-navigation"
import { FloatingActionButtons } from "@/components/floating-action-buttons"
import { ReadingSettingsProvider } from "@/contexts/reading-settings-context"
import { mockChapterNavigation } from "@/lib/chapter-data"
import { ChapterDetail, getChapterEndpointApiChaptersChapterIdGet } from "@/lib/client"
import { useParams } from "next/navigation"

export default function ChapterReadingPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [chapter, setChapter] = useState<ChapterDetail | null>(null)
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>()

  useEffect(() => {
    getChapterEndpointApiChaptersChapterIdGet({
      path: {
        chapter_id: chapterId
      }
    }).then((res) => {
      setChapter(res.data!)
    })
  }, [chapterId])


  const navigation = mockChapterNavigation

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case "ArrowLeft":
        case "Backspace":
          if (navigation.previous_chapter) {
            window.location.href = `/novel/${navigation.novel.id}/chapter/${navigation.previous_chapter.id}`
          }
          break
        case "ArrowRight":
        case " ":
          e.preventDefault()
          if (navigation.next_chapter) {
            window.location.href = `/novel/${navigation.novel.id}/chapter/${navigation.next_chapter.id}`
          }
          break
        case "ArrowUp":
          e.preventDefault()
          window.scrollTo({ top: 0, behavior: "smooth" })
          break
        case "ArrowDown":
          e.preventDefault()
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
          break
        case "Escape":
          setIsSettingsOpen(false)
          break
        case "s":
        case "S":
          setIsSettingsOpen((prev) => !prev)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [navigation])

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100
      setProgress(Math.min(100, Math.max(0, scrollPercent)))
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Save reading position
  useEffect(() => {
    const savePosition = () => {
      localStorage.setItem(
        `reading-position-${navigation.current_chapter.id}`,
        JSON.stringify({
          scrollY: window.scrollY,
          progress,
          timestamp: Date.now(),
        }),
      )
    }

    const interval = setInterval(savePosition, 10000) // Save every 10 seconds
    return () => clearInterval(interval)
  }, [navigation.current_chapter.id, progress])

  // Restore reading position
  useEffect(() => {
    const saved = localStorage.getItem(`reading-position-${navigation.current_chapter.id}`)
    if (saved) {
      try {
        const { scrollY } = JSON.parse(saved)
        window.scrollTo({ top: scrollY, behavior: "instant" as ScrollBehavior })
      } catch (e) {
        console.error("Failed to restore reading position:", e)
      }
    }
  }, [navigation.current_chapter.id])

  return (
    <ReadingSettingsProvider>
      <div className="min-h-screen">
        <ReadingNavbar
          novelId={navigation.novel.id}
          novelTitle={navigation.novel.title}
          chapterTitle={navigation.current_chapter.title}
          chapterOrder={navigation.current_chapter.order}
          onSettingsClick={() => setIsSettingsOpen(true)}
        />

        <ReadingSettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

        <ChapterContent chapter={chapter} novelTitle={chapter?.novel.title} />

        <ChapterNavigation navigation={navigation} />

        <FloatingActionButtons onSettingsClick={() => setIsSettingsOpen(true)} progress={progress} />
      </div>
    </ReadingSettingsProvider>
  )
}
