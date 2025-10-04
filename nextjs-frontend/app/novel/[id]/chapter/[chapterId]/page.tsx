import { ReadingNavbar } from "./_components/reading-navbar";
import { ReadingSettingsPanel } from "./_components/reading-settings-panel";
import { ChapterContent } from "./_components/chapter-content";
import { ChapterNavigation } from "./_components/chapter-navigation";
import { FloatingActionButtons } from "./_components/floating-action-buttons";

import {
  getChapterEndpointApiChaptersChapterIdGet
} from "@/lib/client";
import { notFound } from "next/navigation";

export default  async function ChapterReadingPageContent({params}: {params: Promise<{id: string, chapterId: string}>}) {
  const { id, chapterId } = await params;


  const chapter = await getChapterEndpointApiChaptersChapterIdGet({
    path: {
      chapter_id: chapterId ?? "",
    },
  });
  if(!chapter.data) { 
    return notFound()
  }



  return (
    <div className="min-h-screen">
      <ReadingNavbar
        novelId={id}
        volumeTitle={chapter.data?.volume.title!}
        novelTitle={chapter.data?.novel.title!}
        chapterTitle={chapter?.data?.title!}
        chapterOrder={chapter?.data?.order!}
      />

      <ReadingSettingsPanel />

      <ChapterContent
        chapter={chapter?.data ?? undefined}
        novelTitle={chapter?.data?.novel.title}
      />

       <ChapterNavigation chapter={chapter.data!} />
    
      <FloatingActionButtons />
    </div>
  );
}
