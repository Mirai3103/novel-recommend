"use client"

import { ChevronRight, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface NovelBreadcrumbProps {
  novelTitle: string
  category?: string
}

export function NovelBreadcrumb({ novelTitle, category = "Isekai" }: NovelBreadcrumbProps) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-3 mb-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 hover:bg-background transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Quay lại</span>
      </button>

      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <Home className="w-4 h-4" />
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/category/${category.toLowerCase()}`} className="hover:text-foreground transition-colors">
          {category}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{novelTitle}</span>
      </nav>
    </div>
  )
}
