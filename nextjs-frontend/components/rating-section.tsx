"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Rating } from "@/lib/novel-detail-data"

interface RatingSectionProps {
  ratings: Rating[]
}

export function RatingSection({ ratings }: RatingSectionProps) {
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  const averageRating = ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.rating === star).length,
    percentage: (ratings.filter((r) => r.rating === star).length / ratings.length) * 100,
  }))

  const handleRatingSubmit = () => {
    if (userRating > 0) {
      // Handle rating submission
      console.log("[v0] Submitted rating:", userRating)
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
    <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
      <h2 className="text-2xl font-bold mb-6">Đánh giá & Xếp hạng</h2>

      <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-8">
        {/* Rating Overview */}
        <div className="text-center space-y-4">
          <div>
            <div className="text-6xl font-bold text-yellow-400">{averageRating.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">trên 5.0</div>
          </div>

          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                }`}
              />
            ))}
          </div>

          <div className="text-sm text-muted-foreground">{ratings.length} đánh giá</div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          {distribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium">{star}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-sm text-muted-foreground w-12 text-right">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* User Rating Input */}
      <div className="border-t border-border/50 pt-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Đánh giá của bạn</h3>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setUserRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || userRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted hover:text-yellow-400/50"
                  }`}
                />
              </button>
            ))}
          </div>
          <Button onClick={handleRatingSubmit} disabled={userRating === 0}>
            Gửi đánh giá
          </Button>
        </div>
      </div>

      {/* Recent Ratings */}
      <div className="border-t border-border/50 pt-6">
        <h3 className="text-lg font-semibold mb-4">Đánh giá gần đây</h3>
        <div className="space-y-3">
          {ratings.slice(0, 8).map((rating) => (
            <div
              key={rating.user_id}
              className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
            >
              <img src={rating.avatar || "/placeholder.svg"} alt={rating.username} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="font-medium">{rating.username}</div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= rating.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{getRelativeTime(rating.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4 bg-transparent">
          Xem tất cả đánh giá
        </Button>
      </div>
    </div>
  )
}
