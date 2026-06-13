import Link from 'next/link'
import { Search, SlidersHorizontal, Trophy } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import GameCard from '@/components/GameCard'
import { getDifficultyLabel } from '@/lib/utils'

interface GamesPageProps {
  searchParams: {
    q?: string
    category?: string
    difficulty?: string
  }
}

const ALL_CATEGORIES = [
  '策略', '经济', '引擎构筑', '冒险', '剧情',
  '推理', '家庭', '战棋', '聚会', '谈判',
]

const ALL_DIFFICULTIES = ['easy', 'medium', 'hard']

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const q = searchParams.q || ''
  const categoryFilter = searchParams.category || ''
  const difficultyFilter = searchParams.difficulty || ''

  const user = await getCurrentUser()

  const where: any = {}
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ]
  }
  if (categoryFilter) {
    where.category = { contains: categoryFilter }
  }
  if (difficultyFilter) {
    where.difficulty = difficultyFilter
  }

  const games = await prisma.game.findMany({
    where,
    orderBy: [
      { avgRating: 'desc' },
      { totalRatings: 'desc' },
    ],
  })

  let favoriteGameIds: string[] = []
  if (user) {
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: { gameId: true },
    })
    favoriteGameIds = favorites.map(f => f.gameId)
  }

  const totalGames = games.length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">桌游库</h1>
          <p className="text-text-secondary">发现精彩桌游，找到你的下一个最爱</p>
        </div>
        <Link href="/games/ranking">
          <Button variant="outline" className="gap-2">
            <Trophy className="w-4 h-4" />
            查看排行榜
          </Button>
        </Link>
      </div>

      <Card className="p-4 mb-8">
        <form action="/games" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  name="q"
                  placeholder="搜索桌游名称或描述..."
                  defaultValue={q}
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="md:w-auto w-full">
              搜索
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-text-secondary">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">筛选条件</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-text-muted w-16 shrink-0">分类:</span>
                <Link
                  href={{
                    pathname: '/games',
                    query: {
                      ...(q && { q }),
                      ...(difficultyFilter && { difficulty: difficultyFilter }),
                    },
                  }}
                >
                  <Badge
                    variant={!categoryFilter ? 'primary' : 'default'}
                    className="cursor-pointer"
                  >
                    全部
                  </Badge>
                </Link>
                {ALL_CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={{
                      pathname: '/games',
                      query: {
                        ...(q && { q }),
                        category: cat,
                        ...(difficultyFilter && { difficulty: difficultyFilter }),
                      },
                    }}
                  >
                    <Badge
                      variant={categoryFilter === cat ? 'primary' : 'default'}
                      className="cursor-pointer"
                    >
                      {cat}
                    </Badge>
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-text-muted w-16 shrink-0">难度:</span>
                <Link
                  href={{
                    pathname: '/games',
                    query: {
                      ...(q && { q }),
                      ...(categoryFilter && { category: categoryFilter }),
                    },
                  }}
                >
                  <Badge
                    variant={!difficultyFilter ? 'primary' : 'default'}
                    className="cursor-pointer"
                  >
                    全部
                  </Badge>
                </Link>
                {ALL_DIFFICULTIES.map((diff) => (
                  <Link
                    key={diff}
                    href={{
                      pathname: '/games',
                      query: {
                        ...(q && { q }),
                        ...(categoryFilter && { category: categoryFilter }),
                        difficulty: diff,
                      },
                    }}
                  >
                    <Badge
                      variant={difficultyFilter === diff ? 'primary' : 'default'}
                      className="cursor-pointer"
                    >
                      {getDifficultyLabel(diff)}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </form>
      </Card>

      <div className="flex items-center justify-between mb-6">
        <p className="text-text-secondary">
          共找到 <span className="text-text-primary font-semibold">{totalGames}</span> 款桌游
        </p>
      </div>

      {games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorited={favoriteGameIds.includes(game.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-text-muted mb-2">🎲</div>
          <p className="text-text-secondary mb-4">没有找到匹配的桌游</p>
          <Link href="/games">
            <Button variant="outline" size="sm">
              清除筛选条件
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
