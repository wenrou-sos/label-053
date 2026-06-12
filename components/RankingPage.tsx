'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Gamepad2,
  Heart,
  Users,
  User,
  Star,
  ChevronLeft,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { cn, getDifficultyColor, getDifficultyLabel } from '@/lib/utils'
import type { Game } from '@/types'

type RankingSortKey =
  | 'avgRating'
  | 'totalRatings'
  | 'avgStrategy'
  | 'avgFun'
  | 'avgInteraction'
  | 'avgLuck'

interface RankingPageProps {
  games: (Game & { rank?: number })[]
  allGames: Game[]
}

const SORT_OPTIONS: {
  key: RankingSortKey
  label: string
  icon: typeof Trophy
  description: string
}[] = [
  {
    key: 'avgRating',
    label: '综合评分',
    icon: Trophy,
    description: '玩家综合评分最高的桌游',
  },
  {
    key: 'totalRatings',
    label: '热门程度',
    icon: Users,
    description: '评价人数最多的桌游',
  },
  {
    key: 'avgStrategy',
    label: '策略深度',
    icon: Gamepad2,
    description: '策略性最强的桌游',
  },
  {
    key: 'avgFun',
    label: '趣味指数',
    icon: Heart,
    description: '最具趣味性的桌游',
  },
  {
    key: 'avgInteraction',
    label: '互动指数',
    icon: Users,
    description: '互动性最强的桌游',
  },
  {
    key: 'avgLuck',
    label: '运气成分',
    icon: Star,
    description: '运气影响最大的桌游',
  },
]

function getRankIcon(rank: number) {
  if (rank === 1)
    return <Trophy className="w-5 h-5 text-yellow-400 fill-yellow-400/30" />
  if (rank === 2)
    return <Medal className="w-5 h-5 text-slate-300 fill-slate-300/30" />
  if (rank === 3)
    return <Award className="w-5 h-5 text-amber-600 fill-amber-600/30" />
  return (
    <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-text-muted">
      {rank}
    </span>
  )
}

function getRankBadgeClass(rank: number) {
  if (rank === 1)
    return 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 border-yellow-500/50'
  if (rank === 2)
    return 'bg-gradient-to-br from-slate-300/20 to-slate-400/5 border-slate-300/40'
  if (rank === 3)
    return 'bg-gradient-to-br from-amber-600/30 to-amber-700/10 border-amber-600/50'
  return 'bg-card/50 border-border'
}

export function RankingPage({ games: initialGames, allGames }: RankingPageProps) {
  const [sortKey, setSortKey] = useState<RankingSortKey>('avgRating')

  const sortedGames = [...initialGames]
    .sort((a, b) => {
      const aVal = (a as any)[sortKey] || 0
      const bVal = (b as any)[sortKey] || 0
      if (bVal !== aVal) return bVal - aVal
      return (b.totalRatings || 0) - (a.totalRatings || 0)
    })
    .map((game, index) => ({ ...game, rank: index + 1 }))

  const top3 = sortedGames.slice(0, 3)
  const rest = sortedGames.slice(3)

  const currentSort = SORT_OPTIONS.find((o) => o.key === sortKey)!

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>返回桌游库</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary font-display flex items-center gap-3">
              <Trophy className="w-8 h-8 text-secondary" />
              桌游排行榜
            </h1>
            <p className="text-text-secondary mt-1">{currentSort.description}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.key}
            onClick={() => setSortKey(option.key)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200',
              sortKey === option.key
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-card text-text-secondary hover:text-text-primary hover:bg-card-hover border border-border'
            )}
          >
            <option.icon className="w-4 h-4" />
            {option.label}
          </button>
        ))}
      </div>

      {top3.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[top3[1], top3[0], top3[2]].map((game, idx) => {
            const actualRank = game.rank!
            const isFirst = actualRank === 1
            const heights = ['h-48', 'h-56', 'h-40']
            const heightsSm = ['sm:h-56', 'sm:h-64', 'sm:h-48']
            return (
              <div
                key={game.id}
                className={cn(
                  'flex flex-col items-end',
                  idx === 0 && 'sm:mt-8',
                  idx === 2 && 'sm:mt-16'
                )}
              >
                <Link
                  href={`/games/${game.id}`}
                  className="w-full group"
                >
                  <Card
                    className={cn(
                      'border-2 overflow-hidden transition-all duration-300',
                      getRankBadgeClass(actualRank),
                      isFirst && 'sm:scale-105 shadow-xl shadow-primary/20'
                    )}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={game.coverImage}
                        alt={game.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            actualRank === 1 && 'bg-yellow-500/90',
                            actualRank === 2 && 'bg-slate-300/90',
                            actualRank === 3 && 'bg-amber-600/90'
                          )}
                        >
                          {getRankIcon(actualRank)}
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-2">
                          <StarRating
                            value={Math.round(game.avgRating)}
                            readOnly
                            size="sm"
                          />
                          <span className="text-sm font-medium text-text-primary">
                            {game.avgRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1 mb-2">
                        {game.name}
                      </h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">
                          {game.totalRatings} 条评价
                        </span>
                        <span
                          className={cn(
                            'font-medium',
                            getDifficultyColor(game.difficulty)
                          )}
                        >
                          {getDifficultyLabel(game.difficulty)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            )
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            完整榜单
            <Badge variant="primary" className="ml-2">
              {sortedGames.length} 款桌游
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {rest.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="group"
              >
                <div
                  className={cn(
                    'flex items-center gap-4 p-3 sm:p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-card transition-all duration-200',
                    game.rank! <= 10 && 'bg-card/50'
                  )}
                >
                  <div className="w-10 flex-shrink-0 flex items-center justify-center">
                    {getRankIcon(game.rank!)}
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={game.coverImage}
                      alt={game.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                      {game.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm">
                      <div className="flex items-center gap-1.5">
                        <StarRating
                          value={Math.round(game.avgRating)}
                          readOnly
                          size="sm"
                        />
                        <span className="font-medium text-text-primary">
                          {game.avgRating > 0 ? game.avgRating.toFixed(1) : '-'}
                        </span>
                      </div>
                      <span className="text-text-muted">
                        {game.totalRatings} 评价
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {game.minPlayers}-{game.maxPlayers}人
                      </span>
                      <span
                        className={cn(
                          'font-medium',
                          getDifficultyColor(game.difficulty)
                        )}
                      >
                        {getDifficultyLabel(game.difficulty)}
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:block flex-shrink-0 text-right">
                    <div className="text-xs text-text-muted mb-1">
                      {currentSort.label}
                    </div>
                    <div className="text-xl font-bold text-text-primary">
                      {(game as any)[sortKey] > 0
                        ? sortKey === 'totalRatings'
                          ? (game as any)[sortKey]
                          : (game as any)[sortKey].toFixed(1)
                        : '-'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
