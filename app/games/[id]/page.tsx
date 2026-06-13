import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Users, Clock, BookOpen, MessageCircle, ChevronLeft, BarChart3, Radar } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/StarRating'
import FavoriteButton from '@/components/FavoriteButton'
import { GameRatingRadar } from '@/components/GameRatingRadar'
import { GameRatingTrend, TrendDataPoint } from '@/components/GameRatingTrend'
import {
  getDifficultyLabel,
  getDifficultyColor,
  formatDate,
  cn,
} from '@/lib/utils'

interface GameDetailPageProps {
  params: {
    id: string
  }
}

const RATING_DIMENSIONS = [
  { key: 'avgStrategy', label: '策略性', color: 'text-purple-400' },
  { key: 'avgFun', label: '趣味性', color: 'text-yellow-400' },
  { key: 'avgInteraction', label: '互动性', color: 'text-green-400' },
  { key: 'avgLuck', label: '运气成分', color: 'text-blue-400' },
]

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const game = await prisma.game.findUnique({
    where: { id: params.id },
  })

  if (!game) {
    notFound()
  }

  const user = await getCurrentUser()

  let isFavorited = false
  if (user) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_gameId: {
          userId: user.id,
          gameId: game.id,
        },
      },
    })
    isFavorited = !!favorite
  }

  const reviews = await prisma.gameReview.findMany({
    where: { gameId: game.id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const allReviewsForTrend = await prisma.gameReview.findMany({
    where: { gameId: game.id },
    select: {
      overallRating: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  const radarDimensions = [
    { label: '策略性', value: game.avgStrategy, color: 'purple' },
    { label: '趣味性', value: game.avgFun, color: 'yellow' },
    { label: '互动性', value: game.avgInteraction, color: 'green' },
    { label: '运气成分', value: game.avgLuck, color: 'blue' },
  ]

  const buildTrendData = (raw: { overallRating: number; createdAt: Date }[]): TrendDataPoint[] => {
    if (raw.length < 2) return []
    const groups: Record<string, number[]> = {}
    for (const r of raw) {
      const d = new Date(r.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!groups[key]) groups[key] = []
      groups[key].push(r.overallRating)
    }
    const keys = Object.keys(groups).sort()
    if (keys.length < 2) return []
    return keys.map((k) => {
      const arr = groups[k]
      const [y, m] = k.split('-')
      return {
        label: `${y}/${m}`,
        avg: arr.reduce((s, v) => s + v, 0) / arr.length,
        count: arr.length,
      }
    })
  }

  const trendData = buildTrendData(allReviewsForTrend)

  const categories = game.category.split(',').map(c => c.trim()).filter(Boolean)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>返回桌游库</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1">
          <Card className="overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={game.coverImage}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-text-primary mb-3">
                {game.name}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat) => (
                  <Badge key={cat} variant="primary">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
            <FavoriteButton
              gameId={game.id}
              initialFavorited={isFavorited}
              variant="detail"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StarRating value={Math.round(game.avgRating)} readOnly size="lg" />
                <span className="text-2xl ml-2">
                  {game.avgRating > 0 ? game.avgRating.toFixed(1) : '暂无评分'}
                </span>
                {game.totalRatings > 0 && (
                  <span className="text-text-muted text-sm font-normal ml-2">
                    ({game.totalRatings} 条评价)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {RATING_DIMENSIONS.map(({ key, label, color }) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-text-secondary">{label}</span>
                      <span className={cn('font-semibold', color)}>
                        {(game as any)[key] > 0
                          ? (game as any)[key].toFixed(1)
                          : '-'}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          color.replace('text-', 'bg-')
                        )}
                        style={{
                          width: `${((game as any)[key] / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-text-muted text-sm">
                  <Users className="w-4 h-4" />
                  玩家人数
                </div>
                <p className="text-lg font-semibold text-text-primary">
                  {game.minPlayers} - {game.maxPlayers} 人
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-text-muted text-sm">
                  <Clock className="w-4 h-4" />
                  游戏时长
                </div>
                <p className="text-lg font-semibold text-text-primary">
                  约 {game.playTime} 分钟
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-text-muted text-sm">难度等级</div>
                <p className={cn('text-lg font-semibold', getDifficultyColor(game.difficulty))}>
                  {getDifficultyLabel(game.difficulty)}
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-text-muted text-sm">入库时间</div>
                <p className="text-lg font-semibold text-text-primary">
                  {formatDate(game.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              游戏简介
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
              {game.description}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-secondary" />
              游戏规则
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
              {game.rules}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-purple-400" />
              多维度评分雷达图
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <GameRatingRadar dimensions={radarDimensions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              评分时间趋势
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <GameRatingTrend data={trendData} />
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-text-primary">玩家评论</h2>
          <Badge variant="default" className="ml-2">
            {reviews.length} 条
          </Badge>
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={review.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user.username}`}
                      alt={review.user.username}
                      className="w-10 h-10 rounded-full shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-text-primary">
                            {review.user.username}
                          </span>
                          <StarRating value={review.overallRating} readOnly size="sm" />
                        </div>
                        <span className="text-sm text-text-muted shrink-0">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">策略</span>
                          <span className="text-purple-400 font-medium">{review.strategy}/5</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">趣味</span>
                          <span className="text-yellow-400 font-medium">{review.fun}/5</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">互动</span>
                          <span className="text-green-400 font-medium">{review.interaction}/5</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">运气</span>
                          <span className="text-blue-400 font-medium">{review.luck}/5</span>
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-text-secondary leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">
              还没有玩家评论这款桌游，快去体验一下吧！
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
