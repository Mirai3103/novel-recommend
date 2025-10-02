"use client"

import { useState } from "react"
import { Heart, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Comment } from "@/lib/novel-detail-data"

interface CommentsSectionProps {
  comments: Comment[]
}

export function CommentsSection({ comments }: CommentsSectionProps) {
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest")
  const [newComment, setNewComment] = useState("")
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  const handleLike = (commentId: string) => {
    const newLiked = new Set(likedComments)
    if (newLiked.has(commentId)) {
      newLiked.delete(commentId)
    } else {
      newLiked.add(commentId)
    }
    setLikedComments(newLiked)
  }

  const handlePostComment = () => {
    if (newComment.trim()) {
      console.log("[v0] Posting comment:", newComment)
      setNewComment("")
    }
  }

  const handlePostReply = (commentId: string) => {
    if (replyText.trim()) {
      console.log("[v0] Posting reply to", commentId, ":", replyText)
      setReplyText("")
      setReplyingTo(null)
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Vừa xong"
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays} ngày trước`
    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths} tháng trước`
  }

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else {
      return b.likes - a.likes
    }
  })

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? "ml-12 mt-3" : ""}`}>
      <div className="flex gap-3 p-4 rounded-lg bg-background/30 hover:bg-background/40 transition-colors">
        <img
          src={comment.avatar || "/placeholder.svg"}
          alt={comment.username}
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{comment.username}</span>
            <span className="text-xs text-muted-foreground">{getRelativeTime(comment.created_at)}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{comment.content}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLike(comment.id)}
              className={`flex items-center gap-1 text-sm transition-colors ${
                likedComments.has(comment.id) ? "text-pink-400" : "text-muted-foreground hover:text-pink-400"
              }`}
            >
              <Heart className={`w-4 h-4 ${likedComments.has(comment.id) ? "fill-pink-400" : ""}`} />
              <span>{comment.likes + (likedComments.has(comment.id) ? 1 : 0)}</span>
            </button>
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Trả lời</span>
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Viết câu trả lời..."
                className="min-h-[80px]"
              />
              <div className="flex flex-col gap-2">
                <Button size="sm" onClick={() => handlePostReply(comment.id)}>
                  <Send className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="space-y-3 mt-3">{comment.replies.map((reply) => renderComment(reply, true))}</div>
      )}
    </div>
  )

  return (
    <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
      <h2 className="text-2xl font-bold mb-6">Bình luận ({comments.length})</h2>

      {/* Comment Input */}
      <div className="mb-6 p-4 rounded-lg bg-background/30 border border-border/50">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Chia sẻ suy nghĩ của bạn về light novel này..."
          className="mb-3 min-h-[100px]"
          maxLength={1000}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{newComment.length}/1000 ký tự</span>
          <Button onClick={handlePostComment} disabled={!newComment.trim()}>
            <Send className="w-4 h-4 mr-2" />
            Đăng bình luận
          </Button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 mb-6">
        <Button variant={sortBy === "newest" ? "default" : "outline"} size="sm" onClick={() => setSortBy("newest")}>
          Mới nhất
        </Button>
        <Button variant={sortBy === "oldest" ? "default" : "outline"} size="sm" onClick={() => setSortBy("oldest")}>
          Cũ nhất
        </Button>
        <Button variant={sortBy === "popular" ? "default" : "outline"} size="sm" onClick={() => setSortBy("popular")}>
          Phổ biến
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">{sortedComments.map((comment) => renderComment(comment))}</div>
    </div>
  )
}
