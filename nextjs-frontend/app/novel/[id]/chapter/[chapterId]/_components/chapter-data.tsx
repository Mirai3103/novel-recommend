import { ChapterDetail, SrcNovelsSchemasNovelBrief, VolumeBrief } from "@/lib/client/client.schemas"


export interface ChapterNavigation {
  novel: SrcNovelsSchemasNovelBrief
  current_chapter: ChapterDetail
  previous_chapter?: ChapterDetail
  next_chapter?: ChapterDetail
  total_chapters: number
  current_volume: VolumeBrief
}

export interface ReadingSettings {
  font_family: "serif" | "sans-serif" | "mono"
  font_size: number // 14-26px
  line_height: number // 1.4-2.4
  max_width: "narrow" | "medium" | "wide" // 600px | 750px | 900px
  theme: "light" | "dark" | "sepia" | "night"
  text_align: "left" | "justify"
  auto_scroll_speed: "off" | "slow" | "medium" | "fast"
}

export const defaultReadingSettings: ReadingSettings = {
  font_family: "serif",
  font_size: 18,
  line_height: 1.8,
  max_width: "medium",
  theme: "light",
  text_align: "left",
  auto_scroll_speed: "off",
}


