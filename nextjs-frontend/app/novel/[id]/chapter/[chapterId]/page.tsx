import { ReadingNavbar } from "./_components/reading-navbar";
import { ReadingSettingsPanel } from "./_components/reading-settings-panel";
import { ChapterContent } from "./_components/chapter-content";
import { ChapterNavigation } from "./_components/chapter-navigation";
import { FloatingActionButtons } from "./_components/floating-action-buttons";

import {
  getChapterEndpointApiChaptersChapterIdGet
} from "@/lib/client/chapters";
import { notFound } from "next/navigation";
import md from "@/lib/markdown";
import { tryAsync } from "@/lib/utils/promise";
import { ChapterDetail } from "@/lib/client/client.schemas";
import { FetchError } from "@/lib/api";

export default  async function ChapterReadingPageContent({params}: {params: Promise<{id: string, chapterId: string}>}) {
  const { id, chapterId } = await params;


  const [chapter,error  ] = await tryAsync<ChapterDetail,FetchError>(getChapterEndpointApiChaptersChapterIdGet(chapterId ?? "",{}));
  if(error?.status === 404) { 
    return notFound()
  }

  chapter.content = md.render(chapter.content||"")


  return (
    <div className="min-h-screen">
      <ReadingNavbar
        novelId={id}
        volumeTitle={chapter.volume.title!}
        novelTitle={chapter?.novel.title!}
        chapterTitle={chapter?.title!}
        chapterOrder={chapter?.order!}
      />

      <ReadingSettingsPanel />

      <ChapterContent
        chapter={chapter ?? undefined}
        novelTitle={chapter?.novel.title}
      />

       <ChapterNavigation chapter={chapter!} />
    
      <FloatingActionButtons />
    </div>
  );
}
