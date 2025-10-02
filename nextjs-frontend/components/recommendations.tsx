import { Star, BookOpen } from "lucide-react"

interface RecommendedNovel {
  id: string
  title: string
  image: string
  rating: number
  chapters: number
  tags: string[]
}

interface RecommendationsProps {
  novels: RecommendedNovel[]
}

export function Recommendations({ novels }: RecommendationsProps) {
  return (
    <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
      <h2 className="text-2xl font-bold mb-6">Có thể bạn sẽ thích</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {novels.map((novel) => (
          <button key={novel.id} className="group text-left">
            <div className="relative overflow-hidden rounded-lg mb-3">
              <img
                src={novel.image || "/placeholder.svg"}
                alt={novel.title}
                className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
              {novel.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {novel.rating}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {novel.chapters}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {novel.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
