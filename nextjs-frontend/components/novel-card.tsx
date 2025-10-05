import { Star, Eye, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { SrcNovelsSchemasNovelBrief } from "@/lib/client/client.schemas"
import { getProxiedImageUrl } from "@/lib/utils/image"
import Link from "next/link"
import { Badge } from "./ui/badge"
import numeral from "numeral";
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
interface NovelCardProps {
  novel: NovelBrief
}

export function NovelCard({ novel }: NovelCardProps) {
  return (
    <Card className="group relative pt-0 overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2">
      <CardContent className="p-0">
        <Link href={`/novel/${novel.id}`} className="relative overflow-hidden">
          {/* Cover Image with Parallax Effect */}
          <div className="relative h-[360px] overflow-hidden">
            <img
              src={getProxiedImageUrl(novel.image_url) || "/placeholder.svg"}
              alt={novel.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Animated Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
         {/* {novel.isHot && (
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold shadow-lg border-0 animate-pulse">
                <TrendingUp className="h-3 w-3 mr-1" />
                Hot
              </Badge>
            )}
            {novel.isNew && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold shadow-lg border-0">
                ✨ New
              </Badge>
            )} */}
            {novel.status === "Hoàn thành" && (
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow-lg border-0">
                ✓ Hoàn thành
              </Badge>
            )} 
          </div>

          {/* Rating Badge (Top Right) */}
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-yellow-500/30">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-white font-bold text-xs">{novel.meta.rating||5.0}</span>
            </div>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium">{(numeral(novel.meta.views).format('0.0a'))}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium">{5}</span>
                </div>
              </div>
              <Link href={`/novel/${novel.id}`} className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 shadow-lg">
                Đọc ngay
              </Link>
            </div>
          </div>
        </Link>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-bold text-base line-clamp-2 text-balance leading-tight group-hover:text-primary transition-colors duration-300">
            {novel.title}
          </h3>

          {/* Tags */}
          {novel.tags && novel.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {novel.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.floor(Number(novel.meta.rating)||4.3)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-muted-foreground ml-1">
                {Number(novel.meta.rating)||4.3}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              <span className="font-medium">{ numeral(novel.meta.views).format('0.0a')} views</span>
            </div>
          </div>

          {/* Author */}
          {novel.authors && (
            <p className="text-xs text-muted-foreground truncate">
              <span className="font-medium">Tác giả:</span> {novel.authors.join(", ")}
            </p>
          )}
        </div>

        {/* Decorative Corner Accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </CardContent>
    </Card>
  )
}