import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { RankingPage } from '@/components/RankingPage'

export const metadata: Metadata = {
  title: '桌游排行榜 - 桌游约局平台',
  description: '查看最受欢迎、评分最高的桌游排行榜',
}

export default async function GamesRankingPage() {
  const games = await prisma.game.findMany({
    where: {
      totalRatings: { gt: 0 },
    },
    orderBy: [
      { avgRating: 'desc' },
      { totalRatings: 'desc' },
    ],
  })

  const allGames = await prisma.game.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  })

  return <RankingPage games={games as any} allGames={allGames as any} />
}
