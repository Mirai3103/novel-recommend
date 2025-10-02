import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

interface CategoryCardProps {
  name: string
  count: number
  gradient: string
}

export function CategoryCard({ name, count, gradient }: CategoryCardProps) {
  return (
    <Card className="group overflow-hidden border-0 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105">
      <CardContent className="p-0">
        <div
          className={`bg-gradient-to-br ${gradient} p-6 h-32 flex flex-col justify-between relative overflow-hidden`}
        >
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <BookOpen className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <h3 className="text-white font-bold text-xl">{name}</h3>
            <p className="text-white/90 text-sm mt-1">{count} light novel</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
