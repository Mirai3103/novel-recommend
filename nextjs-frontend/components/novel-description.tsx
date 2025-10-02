"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NovelDescriptionProps {
  description: string
}

export function NovelDescription({ description }: NovelDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const maxLength = 300
  const shouldTruncate = description.length > maxLength

  return (
    <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
      <h2 className="text-2xl font-bold mb-4">Giới thiệu</h2>
      <div className="relative">
        <div
          className={`text-muted-foreground leading-relaxed whitespace-pre-line ${!isExpanded && shouldTruncate ? "max-h-[120px] overflow-hidden" : ""}`}
     
     dangerouslySetInnerHTML={{ __html: description }}
     >
        </div>
        {!isExpanded && shouldTruncate && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/50 to-transparent" />
        )}
      </div>
      {shouldTruncate && (
        <Button variant="ghost" onClick={() => setIsExpanded(!isExpanded)} className="mt-4 w-full">
          {isExpanded ? (
            <>
              Thu gọn <ChevronUp className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Xem thêm <ChevronDown className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      )}
    </div>
  )
}
