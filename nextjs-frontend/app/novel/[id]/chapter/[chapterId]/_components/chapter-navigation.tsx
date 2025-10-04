"use client"

import { ArrowLeft, ArrowRight, List, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import type { ChapterNavigation as ChapterNavigationType } from "@/app/novel/[id]/chapter/[chapterId]/_components/chapter-data"
import { ChapterDetail, getNovelEndpointApiNovelsNovelIdGet } from "@/lib/client"
import useQuery from "@/hooks/use-query"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

interface ChapterNavigationProps {
  chapter: ChapterDetail
}

export function ChapterNavigation({ chapter }: ChapterNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(new Set());

  const { data: novel } = useQuery({
    queryFn: getNovelEndpointApiNovelsNovelIdGet,
    variables: {
      path: {
        novel_id: chapter.novel.id ?? "",
      },
    },
    key: chapter.novel.id,
  });
  const navigation = useMemo<ChapterNavigationType | null>(() => {
    if (!novel?.data || !chapter) return null;

    const allVolumes = [...(novel.data.volumes ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    const flatChapters = allVolumes.flatMap(
      (v) => v.chapters?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ?? []
    );
    const currentIndex = flatChapters.findIndex((c) => c.id === chapter.id);

    if (currentIndex === -1) return null;

    const getChapterWithVolume = (index: number | null) =>
      index === null
        ? null
        : {
            ...flatChapters[index],
            volume: allVolumes.find(
              (v) => v.id === flatChapters[index]?.volume_id
            )!,
          };

    const previousIndex = currentIndex > 0 ? currentIndex - 1 : null;
    const nextIndex =
      currentIndex < flatChapters.length - 1 ? currentIndex + 1 : null;

    return {
      novel: novel.data,
      current_chapter: chapter,
      total_chapters: flatChapters.length,
      previous_chapter: getChapterWithVolume(previousIndex),
      next_chapter: getChapterWithVolume(nextIndex),
      current_volume: allVolumes.find((v) =>
        v.chapters?.some((c) => c.id === chapter.id)
      )!,
    } as ChapterNavigationType;
  }, [novel, chapter]);
  const { previous_chapter, next_chapter } = navigation ?? {};

  // Auto-expand current volume when drawer opens
  useEffect(() => {
    if (isOpen && navigation?.current_volume) {
      setExpandedVolumes(new Set([navigation.current_volume.id]));
    }
  }, [isOpen, navigation?.current_volume]);

  const toggleVolume = (volumeId: string) => {
    const newExpanded = new Set(expandedVolumes);
    if (newExpanded.has(volumeId)) {
      newExpanded.delete(volumeId);
    } else {
      newExpanded.add(volumeId);
    }
    setExpandedVolumes(newExpanded);
  };
  useEffect(() => {
    const savePosition = () => {
      localStorage.setItem(
        `reading-position-${chapter.id}`,
        JSON.stringify({
          scrollY: window.scrollY,
          timestamp: Date.now(),
        })
      );
    };

    const interval = setInterval(savePosition, 10000); // Save every 10 seconds
    return () => clearInterval(interval);
  }, [chapter.id]);

  useEffect(() => {
    if (!chapter?.id) return;
    const saved = localStorage.getItem(`reading-position-${chapter.id}`);
    if (saved) {
      try {
        const { scrollY } = JSON.parse(saved);
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          window.scrollTo({ top: scrollY, behavior: "auto" });
        }, 0);
      } catch (e) {
        console.error("Failed to restore reading position:", e);
      }
    }
  }, [chapter?.id]);


  return (
    <div className="border-t border-border/50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Previous */}
          <Link
            href={previous_chapter ? `/novel/${chapter.novel.id}/chapter/${previous_chapter.id}` : "#"}
            className={previous_chapter ? "" : "pointer-events-none"}
          >
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex-col items-start gap-2 bg-transparent"
              disabled={!previous_chapter}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs">Chương trước</span>
              </div>
              {previous_chapter && (
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">{previous_chapter?.volume?.title}</div>
                  <div className="text-sm font-medium line-clamp-1">{previous_chapter.title}</div>
                </div>
              )}
            </Button>
          </Link>

          {/* Chapter List Drawer */}
          <Button 
            variant="outline" 
            className="w-full h-full flex-col gap-2 bg-transparent"
            onClick={() => setIsOpen(true)}
          >
            <List className="w-5 h-5" />
            <span className="text-sm">Danh sách chương</span>
          </Button>

          {/* Next */}
          <Link
            href={next_chapter ? `/novel/${chapter.novel.id}/chapter/${next_chapter.id}` : "#"}
            className={next_chapter ? "" : "pointer-events-none"}
          >
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex-col items-end gap-2 bg-transparent"
              disabled={!next_chapter}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">Chương tiếp</span>
                <ArrowRight className="w-4 h-4" />
              </div>
              {next_chapter && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{next_chapter?.volume?.title}</div>
                  <div className="text-sm font-medium line-clamp-1">{next_chapter.title}</div>
                </div>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Chapters Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle>Danh sách chương</SheetTitle>
            <div className="text-sm text-muted-foreground">
              {novel?.data?.title}
            </div>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-4 space-y-2">
              {novel?.data?.volumes?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((volume) => (
                <div 
                  key={volume.id} 
                  className={cn(
                    "border rounded-lg overflow-hidden",
                    volume.id === navigation?.current_volume?.id ? "border-primary" : "border-border/50"
                  )}
                >
                  <button
                    onClick={() => toggleVolume(volume.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 transition-colors text-left",
                      volume.id === navigation?.current_volume?.id 
                        ? "bg-primary/10" 
                        : "bg-background/30 hover:bg-background/50"
                    )}
                  >
                    <img
                      src={volume.image_url || "/placeholder.svg"}
                      alt={volume.title!}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-semibold text-sm truncate",
                        volume.id === navigation?.current_volume?.id && "text-primary"
                      )}>
                        {volume.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {volume.chapters?.length || 0} chương
                      </p>
                    </div>
                    {expandedVolumes.has(volume.id) ? (
                      <ChevronUp className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    )}
                  </button>

                  {expandedVolumes.has(volume.id) && (
                    <div className="divide-y divide-border/30">
                      {volume.chapters
                        ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((chap) => (
                          <Link
                            href={`/novel/${volume.novel_id}/chapter/${chap.id}`}
                            key={chap.id}
                            onClick={() => {
                              setIsOpen(false)
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            className={cn(
                              "block p-3 transition-colors",
                              chap.id === chapter.id
                                ? "bg-primary/20 border-l-4 border-primary"
                                : "hover:bg-background/30"
                            )}
                          >
                            <div className={cn(
                              "text-sm font-medium",
                              chap.id === chapter.id 
                                ? "text-primary" 
                                : "group-hover:text-primary"
                            )}>
                              {chap.title}
                            </div>
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
