import Link from 'next/link'
import { Users, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { getDifficultyLabel, getDifficultyColor, cn } from '@/lib/utils'
import FavoriteButton from '@/components/FavoriteButton'

interface GameCardProps {
  game: {
    id: string
    name: string
    coverImage: string
    minPlayers: number
    maxPlayers: number
    playTime: number
    difficulty: string
    category: string
    avgRating: number
    totalRatings: number
  }
  isFavorited?: boolean
  showFavorite?: boolean
}

export default function GameCard({ game, isFavorited = false, showFavorite = true }: GameCardProps) {
  const categories = game.category.split(',').map(c => c.trim()).filter(Boolean)

  return (
    <Card className="group flex flex-col overflow-hidden hover:border-primary/50">
      <Link href={`/games/${game.id}`} className="relative aspect-[4/3] overflow-hidden">
        <img
          src={game.coverImage}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        {showFavorite && (
          <div className="absolute top-3 right-3 z-10">
            <FavoriteButton gameId={game.id} initialFavorited={isFavorited} variant="card" />
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StarRating value={Math.round(game.avgRating)} readOnly size="sm" />
            <span className="text-sm font-medium text-text-primary">
              {game.avgRating > 0 ? game.avgRating.toFixed(1) : '暂无'}
            </span>
            {game.totalRatings > 0 && (
              <span className="text-xs text-text-muted">({game.totalRatings})</span>
            )}
          </div>
        </div>
      </Link>

      <CardContent className="flex-1 flex flex-col gap-3 p-4">
        <Link href={`/games/${game.id}`}>
          <h3 className="font-bold text-text-primary text-lg group-hover:text-primary transition-colors line-clamp-1">
            {game.name}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1.5">
          {categories.slice(0, 2).map((cat) => (
            <Badge key={cat} variant="primary" className="text-xs">
              {cat}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-text-secondary">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{game.minPlayers}-{game.maxPlayers}人</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{game.playTime}分钟</span>
            </div>
          </div>
          <span className={cn('font-medium text-sm', getDifficultyColor(game.difficulty))}>
            {getDifficultyLabel(game.difficulty)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
