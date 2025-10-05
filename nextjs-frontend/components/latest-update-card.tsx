import { Clock, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SrcNovelsSchemasNovelBrief } from "@/lib/client/client.schemas"
import { getProxiedImageUrl } from "@/lib/utils/image"
import Link from "next/link"
import dayjs from "dayjs"
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

interface LatestUpdateCardProps {
  novel: NovelBrief
}

export function LatestUpdateCard({ novel }: LatestUpdateCardProps) {
  return (
    <Card className="group overflow-hidden py-0 border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-0">
        <Link href={`/novel/${novel.id}`} className="flex gap-4 p-4">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={getProxiedImageUrl(novel.image_url) || "/placeholder.svg"}
              alt={novel.title}
              className="w-[90px] h-[130px] object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Chapter count badge */}
            {/* <div className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-md">
              <span className="text-white text-[10px] font-bold">{5} ch</span>
            </div> */}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2.5">
            {/* Title */}
            <h3 className="font-bold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
              {novel.title}
            </h3>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5">
              {(novel.tags||[]).slice(0, 3).map((genre) => (
                <Badge 
                  key={genre} 
                  variant="secondary" 
                  className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-0"
                >
                  {genre}
                </Badge>
              ))}
            </div>

            {/* Latest Chapter */}
            <div className="flex items-start gap-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground line-clamp-1 font-medium">
                {"Chương "}5{": "}{"Hồi kết"}
              </p>
            </div>

            {/* Time & Stats */}
            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-green-500" />
                <span className="font-medium">{dayjs(novel.last_updated).fromNow()}</span>
              </div>
              
              {/* {novel.isHot && (
                <div className="flex items-center gap-1 text-[10px] text-red-500 font-bold">
                  <TrendingUp className="h-3 w-3" />
                  <span>HOT</span>
                </div>
              )} */}
            </div>
          </div>
        </Link>

        {/* Bottom accent line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </CardContent>
    </Card>
  )
}