"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Eye, FileText, Clock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VolumeOut } from "@/lib/client"
import Link from "next/link"

interface VolumesChaptersProps {
  volumes: VolumeOut[]
}

export function VolumesChapters({ volumes }: VolumesChaptersProps) {
  const [viewMode, setViewMode] = useState<"volume" | "list">("volume")
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(new Set([volumes[0]?.id]))

  const toggleVolume = (volumeId: string) => {
    const newExpanded = new Set(expandedVolumes)
    if (newExpanded.has(volumeId)) {
      newExpanded.delete(volumeId)
    } else {
      newExpanded.add(volumeId)
    }
    setExpandedVolumes(newExpanded)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const isNew = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    return diffInHours < 24
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) return `${diffInHours}h trước`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays}d trước`
    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}m trước`
  }

  const allChapters = volumes.flatMap((v) => v?.chapters?.map((c) => ({ ...c, volumeTitle: v.title })))

  return (
    <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Danh sách chương</h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "volume" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("volume")}
          >
            Theo Volume
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            Tất cả
          </Button>
        </div>
      </div>

      {viewMode === "volume" ? (
        <div className="space-y-4">
          {volumes.map((volume) => (
            <div key={volume.id} className="border border-border/50 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleVolume(volume.id)}
                className="w-full flex items-center gap-4 p-4 bg-background/30 hover:bg-background/50 transition-colors"
              >
                <img
                  src={volume.image_url || "/placeholder.svg"}
                  alt={volume.title!}
                  className="w-16 h-24 object-cover rounded"
                />
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg">{volume.title}</h3>
                  <p className="text-sm text-muted-foreground">{volume.chapters?.length||0} chương</p>
                </div>
                {expandedVolumes.has(volume.id) ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {expandedVolumes.has(volume.id) && (
                <div className="divide-y divide-border/30">
                  {volume.chapters?.map((chapter) => (
                    <Link
                      href={`/novel/${volume.novel_id}/chapter/${chapter.id}`}
                      key={chapter.id}
                      className="w-full flex items-center gap-3 p-4 hover:bg-background/30 transition-colors group"
                    >
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium group-hover:text-purple-400 transition-colors">
                            {chapter.title}
                          </span>
                          {/* {chapter.meta?.published_date && isNew(chapter.meta.published_date) && (
                            <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-xs border border-pink-500/30 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              New
                            </span>
                          )} */}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {/* {chapter.meta.published_date && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getRelativeTime(chapter.meta.published_date)}
                            </span>
                          )}
                          {chapter.meta.word_count && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {formatNumber(chapter.meta.word_count)} từ
                            </span>
                          )}
                          {chapter.meta.views && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatNumber(chapter.meta.views)}
                            </span>
                          )} */}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border/30 border border-border/50 rounded-lg overflow-hidden">
          {allChapters.map((chapter) => (
            <button
              key={chapter?.id!}
              className="w-full flex items-center gap-3 p-4 hover:bg-background/30 transition-colors group"
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium group-hover:text-purple-400 transition-colors">{chapter?.title}</span>
                  {/* {chapter.meta.published_date && isNew(chapter.meta.published_date) && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-xs border border-pink-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      New
                    </span>
                  )} */}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{chapter?.volumeTitle}</span>
                  {/* {chapter.meta.published_date && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getRelativeTime(chapter.meta.published_date)}
                    </span>
                  )}
                  {chapter.meta.word_count && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {formatNumber(chapter.meta.word_count)} từ
                    </span>
                  )}
                  {chapter.meta.views && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatNumber(chapter.meta.views)}
                    </span>
                  )} */}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
