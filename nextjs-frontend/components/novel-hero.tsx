"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BookOpen, BookmarkPlus, Star, Calendar, User, Palette, Tag, BookMarked, Share2, Check } from "lucide-react"
import type { Novel } from "@/lib/novel-detail-data"
import { NovelDetail } from "@/lib/client"
import { getProxiedImageUrl } from "@/lib/utils/image"

interface NovelHeroProps {
  novel: NovelDetail
  averageRating: number
  totalRatings: number
  totalChapters: number
}

export function NovelHero({ novel, averageRating, totalRatings, totalChapters }: NovelHeroProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showShareToast, setShowShareToast] = useState(false)

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 2000)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Đang tiến hành":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Hoàn thành":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Tạm dừng":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) return `${diffInHours} giờ trước`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays} ngày trước`
    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths} tháng trước`
  }

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-8 mb-12">
      {/* Left Column - Cover & Actions */}
      <div className="space-y-4">
        <div className="relative group overflow-hidden rounded-xl">
          <Image
            src={getProxiedImageUrl(novel.image_url) || "/placeholder.svg"}
            alt={novel.title}
            width={300}
            height={450}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2">
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Đọc từ đầu
          </Button>
          <Button variant="outline" className="w-full bg-transparent" size="lg">
            <BookMarked className="w-5 h-5 mr-2" />
            Đọc tiếp
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleBookmark}
              className={isBookmarked ? "bg-pink-500/20 border-pink-500/50" : ""}
            >
              {isBookmarked ? <Check className="w-4 h-4 mr-2" /> : <BookmarkPlus className="w-4 h-4 mr-2" />}
              {isBookmarked ? "Đã lưu" : "Thư viện"}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Chia sẻ
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
      
      </div>

      {/* Right Column - Info */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-balance">{novel.title}</h1>
          <div className="space-y-1">
            {novel.other_titles?.map((title, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                {title}
              </p>
            ))}
          </div>
        </div>

        {/* Meta Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tác giả:</span>
            {novel.authors?.map((author, index) => (
              <span key={index}>
                <button className="text-purple-400 hover:text-purple-300 transition-colors">{author}</button>
                {index < (novel.authors?.length||0) - 1 && ", "}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Họa sĩ:</span>
            {novel.artists?.map((artist, index) => (
              <span key={index}>
                <button className="text-pink-400 hover:text-pink-300 transition-colors">{artist}</button>
                {index < (novel.artists?.length||0) - 1 && ", "}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm border border-purple-500/30">
              {novel.type}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(novel.status!)}`}>
              {novel.status}
            </span>
          </div>
{/* 
          {novel.meta.publisher && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Nhà xuất bản:</span>
              <span>{novel.meta.publisher}</span>
              {novel.meta.year && <span className="text-muted-foreground">({novel.meta.year})</span>}
            </div>
          )} */}

          {novel.last_updated && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Cập nhật:</span>
              <span>{getRelativeTime(novel.last_updated)}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Thể loại:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {novel.tags?.map((tag, index) => (
              <button
                key={index}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/20 text-sm transition-all hover:scale-105"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="text-2xl font-bold text-purple-400">{totalChapters}</div>
            <div className="text-xs text-muted-foreground">Chương</div>
          </div>
          <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="text-2xl font-bold text-pink-400">{formatNumber(novel.meta?.total_views || 0)}</div>
            <div className="text-xs text-muted-foreground">Lượt xem</div>
          </div>
          <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="text-2xl font-bold text-blue-400">{formatNumber(novel.meta.total_favorites || 0)}</div>
            <div className="text-xs text-muted-foreground">Yêu thích</div>
          </div>
          <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">{averageRating.toFixed(1)}</span>
            </div>
            <div className="text-xs text-muted-foreground">{totalRatings} đánh giá</div>
          </div>
        </div>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-5 z-50">
          Đã sao chép link!
        </div>
      )}
    </div>
  )
}
