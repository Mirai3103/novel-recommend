import { NovelBreadcrumb } from "@/components/novel-breadcrumb"
import { NovelHero } from "@/components/novel-hero"
import { NovelDescription } from "@/components/novel-description"
import { RatingSection } from "@/components/rating-section"
import { VolumesChapters } from "@/components/volumes-chapters"
import { CommentsSection } from "@/components/comments-section"
import { Recommendations } from "@/components/recommendations"
import { mockComments, recommendedNovels } from "@/lib/novel-detail-data"
import { getNovelEndpointApiNovelsNovelIdGet } from "@/lib/client"
import { notFound } from "next/navigation"

export default async function NovelDetailPage({ params }: { params:Promise<{ id: string }> }) {
  const novel = await getNovelEndpointApiNovelsNovelIdGet({
    path: {
      novel_id: (await params).id
    }
  })
  if(novel.error) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/10 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <NovelBreadcrumb novelTitle={novel.data?.title!} category="Isekai" />

        <NovelHero
          novel={novel.data!}
          averageRating={4.3}
          totalRatings={245}
          totalChapters={novel.data?.volumes?.reduce((acc, vol) => acc + (vol.chapters?.length||0), 0)||0}
        />

        <div className="space-y-8">
          <NovelDescription description={novel.data?.description!} />

          {/* <RatingSection ratings={245} /> */}

          <VolumesChapters volumes={novel.data?.volumes!} />

          <CommentsSection comments={mockComments} />

          <Recommendations novels={recommendedNovels} />
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <button className="fixed bottom-6 right-6 lg:hidden w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50">
        <BookOpen className="w-6 h-6 text-white" />
      </button>
    </div>
  )
}

function BookOpen({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  )
}
