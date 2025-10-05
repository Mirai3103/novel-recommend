"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star, Play, BookmarkPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProxiedImageUrl } from "@/lib/utils/image"
import { Badge } from "./ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SrcNovelsSchemasNovelBrief } from "@/lib/client/client.schemas"
type NovelBrief = Omit<SrcNovelsSchemasNovelBrief, "meta"> & {
  meta: {
    bookmark_count: string;
    hako_url: string;
    is_crawled_detail: boolean;
    is_crawled_volume: boolean;
    last_update: string;
    post_crawler: boolean;
    rating: string;
    views: string;
    word_count: string;
  };
};
interface HeroCarouselProps {
  featuredNovels: NovelBrief[]
}
export function HeroCarousel({ featuredNovels }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredNovels.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [featuredNovels.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredNovels.length) % featuredNovels.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredNovels.length)
  }

  const currentNovel = featuredNovels[currentSlide] || {meta: {rating: 0}}

  return (
    <div className="relative w-full lg:pl-14 h-[500px] md:h-[600px] overflow-hidden rounded-xl">
      {/* Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${getProxiedImageUrl(currentNovel?.image_url) || "/placeholder.svg"})`,
          filter: "blur(20px)",
          transform: "scale(1.1)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />

      {/* Content */}
      <Link href={`/novel/${currentNovel.id}`}  className="relative h-full container mx-auto px-4 flex items-center">
        <div className="grid md:grid-cols-2 gap-8 items-center w-full">
          {/* Text Content */}
          <div className="space-y-4 z-10">
            {/* <div className="flex gap-2">
              {currentNovel.isHot && <Badge className="bg-red-500 text-white">Hot</Badge>}
              {currentNovel.isNew && <Badge className="bg-green-500 text-white">New</Badge>}
            </div> */}
            {currentNovel.status === "Hoàn thành" && (
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow-lg border-0">
                ✓ Hoàn thành
              </Badge>
            )} 
            <h1 className="text-4xl md:text-5xl font-bold text-balance">{currentNovel.title}</h1>
            <p className="text-muted-foreground text-lg">Tác giả: {currentNovel.authors?.join(", ")}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(Number(currentNovel.meta?.rating)||0) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{Number(currentNovel.meta.rating)||0}</span>
            </div>
            <p className="text-foreground/80 text-pretty line-clamp-3">{currentNovel.status}</p>
            <div className="flex gap-3 pt-2">
              <Button size="lg" className="gap-2" onClick={() => router.push(`/novel/${currentNovel.id}`)}>
                <Play className="h-5 w-5" />
                Đọc ngay
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                <BookmarkPlus className="h-5 w-5" />
                Thêm vào thư viện
              </Button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="hidden md:flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg transform group-hover:scale-105 transition-transform duration-300" />
              <img
                src={getProxiedImageUrl(currentNovel?.image_url) || "/placeholder.svg"}
                alt={currentNovel.title}
                className="w-[300px] h-[450px] object-cover rounded-lg shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </Link>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/50 backdrop-blur-sm hover:bg-background/80"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/50 backdrop-blur-sm hover:bg-background/80"
        onClick={goToNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {featuredNovels.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
