"use client"

import { ArrowLeft, ArrowRight, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { ChapterNavigation as ChapterNavigationType } from "@/lib/chapter-data"

interface ChapterNavigationProps {
  navigation: ChapterNavigationType
}

export function ChapterNavigation({ navigation }: ChapterNavigationProps) {
  const { novel, previous_chapter, next_chapter } = navigation

  return (
    <div className="border-t border-border/50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Previous */}
          <Link
            href={previous_chapter ? `/novel/${novel.id}/chapter/${previous_chapter.id}` : "#"}
            className={previous_chapter ? "" : "pointer-events-none"}
          >
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex-col items-start gap-2 bg-transparent"
              disabled={!previous_chapter}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs">Chương trước</span>
              </div>
              {previous_chapter && (
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Chapter {previous_chapter.order}</div>
                  <div className="text-sm font-medium line-clamp-1">{previous_chapter.title}</div>
                </div>
              )}
            </Button>
          </Link>

          {/* Back to Novel */}
          <Link href={`/novel/${novel.id}`}>
            <Button variant="outline" className="w-full h-full flex-col gap-2 bg-transparent">
              <List className="w-5 h-5" />
              <span className="text-sm">Danh sách chương</span>
            </Button>
          </Link>

          {/* Next */}
          <Link
            href={next_chapter ? `/novel/${novel.id}/chapter/${next_chapter.id}` : "#"}
            className={next_chapter ? "" : "pointer-events-none"}
          >
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex-col items-end gap-2 bg-transparent"
              disabled={!next_chapter}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">Chương tiếp</span>
                <ArrowRight className="w-4 h-4" />
              </div>
              {next_chapter && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Chapter {next_chapter.order}</div>
                  <div className="text-sm font-medium line-clamp-1">{next_chapter.title}</div>
                </div>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
