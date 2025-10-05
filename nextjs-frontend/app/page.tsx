import { Header } from "@/components/header"
import { HeroCarousel } from "@/components/hero-carousel"
import { NovelCard } from "@/components/novel-card"
import { LatestUpdateCard } from "@/components/latest-update-card"
import { CategoryCard } from "@/components/category-card"
import { categories } from "@/lib/mock-data"
import { Flame, Clock, Grid3x3 } from "lucide-react"
import { listNovelsEndpointApiNovelsGet } from "@/lib/client/novels"

export default async function HomePage() {

  const [trendingNovels, latestUpdates] = await Promise.all([
    listNovelsEndpointApiNovelsGet({
      limit: 10, sort_by: 'views', sort_dir: 'desc' 
    }).then(res => res as any[]),
    listNovelsEndpointApiNovelsGet({
      limit: 8, sort_by: 'last_updated', sort_dir: 'desc' 
    }).then(res => res as any[])
  ])
  

  return (


      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* Hero Section */}
        <section>
          <HeroCarousel featuredNovels={trendingNovels.slice(0, 5)} />
        </section>

        {/* Trending Section */}
        <section id="trending" className="space-y-6">
          <div className="flex items-center gap-3">
            <Flame className="h-8 w-8 text-red-500" />
            <h2 className="text-3xl font-bold">Đang Trending</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trendingNovels.map((novel) => (
              <NovelCard key={novel.id} novel={novel } />
            ))}
          </div>
        </section>

        {/* Latest Updates Section */}
        <section id="latest" className="space-y-6">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-500" />
            <h2 className="text-3xl font-bold">Mới Cập Nhật</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {latestUpdates.map((novel) => (
              <LatestUpdateCard key={novel.id} novel={novel} />
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="space-y-6">
          <div className="flex items-center gap-3">
            <Grid3x3 className="h-8 w-8 text-purple-500" />
            <h2 className="text-3xl font-bold">Thể Loại</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.name}
                name={category.name}
                count={category.count}
                gradient={category.gradient}
              />
            ))}
          </div>
        </section>
      </main>

   
  )
}
