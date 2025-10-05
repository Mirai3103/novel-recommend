"use client"

import { useState, useMemo } from "react"
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NovelCard } from "@/components/novel-card"
import { mockNovels, categories } from "@/lib/mock-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

const statusOptions = ["Đang tiến hành", "Hoàn thành", "Tạm dừng"]
const allGenres = categories.map(c => c.name)

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [authorFilter, setAuthorFilter] = useState("")
  const [artistFilter, setArtistFilter] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("relevant")

  // Toggle genre selection
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  // Toggle status selection
  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setAuthorFilter("")
    setArtistFilter("")
    setSelectedGenres([])
    setSelectedStatuses([])
    setSortBy("relevant")
  }

  // Count active filters
  const activeFiltersCount = [
    authorFilter,
    artistFilter,
    selectedGenres.length > 0,
    selectedStatuses.length > 0,
  ].filter(Boolean).length

  // Filter and sort novels
  const filteredNovels = useMemo(() => {
    let filtered = mockNovels.filter(novel => {
      // Search query
      if (searchQuery && !novel.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Author filter
      if (authorFilter && !novel.author.toLowerCase().includes(authorFilter.toLowerCase())) {
        return false
      }

      // Artist filter (mock - using author as fallback)
      if (artistFilter && !novel.author.toLowerCase().includes(artistFilter.toLowerCase())) {
        return false
      }

      // Genre filter
      if (selectedGenres.length > 0) {
        const hasMatchingGenre = selectedGenres.some(genre => 
          novel.genres.includes(genre)
        )
        if (!hasMatchingGenre) return false
      }

      // Status filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(novel.status)) {
        return false
      }

      return true
    })

    // Sort
    switch (sortBy) {
      case "title-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "views":
        filtered.sort((a, b) => b.views - a.views)
        break
      case "chapters":
        filtered.sort((a, b) => b.chapters - a.chapters)
        break
      case "new":
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
    }

    return filtered
  }, [searchQuery, authorFilter, artistFilter, selectedGenres, selectedStatuses, sortBy])

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Tìm Kiếm Truyện
        </h1>
        <p className="text-muted-foreground">
          Khám phá hàng nghìn light novel đang chờ bạn đọc
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm theo tên truyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-muted/50 border-border/50 focus:bg-muted focus:border-primary/50 transition-all duration-300"
            />
          </div>

          {/* Sort Select */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px] h-12 bg-muted/50">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevant">Liên quan</SelectItem>
              <SelectItem value="title-asc">Tên A-Z</SelectItem>
              <SelectItem value="title-desc">Tên Z-A</SelectItem>
              <SelectItem value="rating">Đánh giá cao</SelectItem>
              <SelectItem value="views">Lượt xem</SelectItem>
              <SelectItem value="chapters">Số chương</SelectItem>
              <SelectItem value="new">Mới nhất</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Toggle Button */}
          <Button
            variant={showFilters ? "default" : "outline"}
            className="h-12 gap-2 relative"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="hidden sm:inline">Bộ lọc</span>
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-red-500">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                Bộ Lọc Nâng Cao
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Xóa tất cả
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Author Filter */}
              <div className="space-y-2">
                <Label htmlFor="author" className="text-sm font-medium">
                  Tác giả
                </Label>
                <Input
                  id="author"
                  placeholder="Nhập tên tác giả..."
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              {/* Artist Filter */}
              <div className="space-y-2">
                <Label htmlFor="artist" className="text-sm font-medium">
                  Họa sĩ
                </Label>
                <Input
                  id="artist"
                  placeholder="Nhập tên họa sĩ..."
                  value={artistFilter}
                  onChange={(e) => setArtistFilter(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              {/* Genre Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Thể loại</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-background/50 h-10"
                    >
                      <span className="text-muted-foreground">
                        {selectedGenres.length > 0
                          ? `${selectedGenres.length} thể loại đã chọn`
                          : "Chọn thể loại..."}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <ScrollArea className="h-[300px]">
                      <div className="p-4 space-y-3">
                        {allGenres.map((genre) => (
                          <div key={genre} className="flex items-center space-x-2">
                            <Checkbox
                              id={`genre-${genre}`}
                              checked={selectedGenres.includes(genre)}
                              onCheckedChange={() => toggleGenre(genre)}
                            />
                            <Label
                              htmlFor={`genre-${genre}`}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {genre}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                {selectedGenres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedGenres.map((genre) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-destructive/20"
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tình trạng</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-background/50 h-10"
                    >
                      <span className="text-muted-foreground">
                        {selectedStatuses.length > 0
                          ? `${selectedStatuses.length} tình trạng đã chọn`
                          : "Chọn tình trạng..."}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0" align="start">
                    <div className="p-4 space-y-3">
                      {statusOptions.map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={() => toggleStatus(status)}
                          />
                          <Label
                            htmlFor={`status-${status}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {selectedStatuses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedStatuses.map((status) => (
                      <Badge
                        key={status}
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-destructive/20"
                        onClick={() => toggleStatus(status)}
                      >
                        {status}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {(activeFiltersCount > 0 || searchQuery) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Tìm thấy <span className="font-bold text-primary">{filteredNovels.length}</span> kết quả
            </span>
            {activeFiltersCount > 0 && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <span>{activeFiltersCount} bộ lọc đang áp dụng</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Results Grid */}
      {filteredNovels.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredNovels.map((novel) => (
            <NovelCard key={novel.id} novel={{
              id: String(novel.id),
              title: novel.title,
              image_url: novel.coverImage,
              authors: [novel.author],
              tags: novel.genres,
              status: novel.status,
              last_updated: novel.lastUpdate,
              type: "Light Novel",
              meta: {
                rating: String(novel.rating),
                views: String(novel.views),
                bookmark_count: "0",
                word_count: "0",
                hako_url: "",
                is_crawled_detail: true,
                is_crawled_volume: true,
                last_update: novel.lastUpdate || "",
                post_crawler: false,
              }
            }} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <Search className="h-20 w-20 text-muted-foreground/30" />
            <div className="absolute inset-0 bg-primary/10 blur-3xl" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold">Không tìm thấy kết quả</h3>
            <p className="text-muted-foreground">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn
            </p>
          </div>
          {(activeFiltersCount > 0 || searchQuery) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                clearFilters()
              }}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Xóa tất cả bộ lọc
            </Button>
          )}
        </div>
      )}
    </main>
  )
}
