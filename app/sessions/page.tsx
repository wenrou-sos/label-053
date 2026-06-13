import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { SessionCard } from '@/components/SessionCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

interface SearchParams {
  searchParams: {
    game?: string
    status?: string
    time?: string
    q?: string
  }
}

const timeRanges = [
  { value: 'all', label: '全部时间' },
  { value: 'today', label: '今天' },
  { value: 'tomorrow', label: '明天' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
]

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'upcoming', label: '即将开始' },
  { value: 'ongoing', label: '进行中' },
  { value: 'completed', label: '已结束' },
  { value: 'cancelled', label: '已取消' },
]

export default async function SessionsPage({ searchParams }: SearchParams) {
  const { game: gameId, status, time, q } = searchParams

  const user = await getCurrentUser()

  const games = await prisma.game.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  const where: any = {
    isPublic: true,
  }

  if (gameId && gameId !== 'all') {
    where.gameId = gameId
  }

  if (status && status !== 'all') {
    where.status = status
  }

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { location: { contains: q } },
    ]
  }

  const now = new Date()
  if (time && time !== 'all') {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)

    switch (time) {
      case 'today':
        where.startTime = { gte: startOfDay, lte: endOfDay }
        break
      case 'tomorrow':
        const tomorrowStart = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
        const tomorrowEnd = new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000 - 1)
        where.startTime = { gte: tomorrowStart, lte: tomorrowEnd }
        break
      case 'week':
        const weekEnd = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
        where.startTime = { gte: startOfDay, lte: weekEnd }
        break
      case 'month':
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        where.startTime = { gte: startOfDay, lte: monthEnd }
        break
    }
  }

  const sessions = await prisma.gameSession.findMany({
    where,
    include: {
      game: { select: { id: true, name: true, coverImage: true } },
      creator: { select: { id: true, username: true, avatar: true } },
      _count: { select: { registrations: { where: { status: 'approved' } } } },
    },
    orderBy: { startTime: 'asc' },
  })

  const gameOptions = [
    { value: 'all', label: '全部游戏' },
    ...games.map(g => ({ value: g.id, label: g.name })),
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary font-display">
            约局列表
          </h1>
          <p className="text-text-secondary mt-1">
            找到志同道合的桌游伙伴，开启你的桌游之旅
          </p>
        </div>
        <Link href="/sessions/create">
          <Button size="lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            创建约局
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 mb-8">
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Input
              label="搜索约局"
              name="q"
              defaultValue={q}
              placeholder="搜索标题、地点..."
            />
          </div>
          <Suspense fallback={<div className="h-[70px] bg-background rounded-lg animate-pulse" />}>
            <Select
              label="游戏筛选"
              name="game"
              defaultValue={gameId || 'all'}
              options={gameOptions}
            />
          </Suspense>
          <Suspense fallback={<div className="h-[70px] bg-background rounded-lg animate-pulse" />}>
            <Select
              label="状态筛选"
              name="status"
              defaultValue={status || 'all'}
              options={statusOptions}
            />
          </Suspense>
          <Suspense fallback={<div className="h-[70px] bg-background rounded-lg animate-pulse" />}>
            <Select
              label="时间筛选"
              name="time"
              defaultValue={time || 'all'}
              options={timeRanges}
            />
          </Suspense>
          <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-3">
            <Link href="/sessions">
              <Button type="button" variant="ghost">
                重置
              </Button>
            </Link>
            <Button type="submit">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              筛选
            </Button>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="primary">
            共 {sessions.length} 个约局
          </Badge>
          {(gameId && gameId !== 'all') || (status && status !== 'all') || (time && time !== 'all') || q ? (
            <Badge variant="secondary">
              已筛选
            </Badge>
          ) : null}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-card border border-border flex items-center justify-center">
            <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            暂无约局
          </h3>
          <p className="text-text-secondary mb-6">
            没有找到符合条件的约局，换个筛选条件试试？
          </p>
          <Link href="/sessions/create">
            <Button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              创建第一个约局
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session as any}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
