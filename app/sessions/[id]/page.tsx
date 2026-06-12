import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { SessionDetail } from '@/components/SessionDetail'

interface SessionDetailPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params,
}: SessionDetailPageProps): Promise<Metadata> {
  const session = await prisma.gameSession.findUnique({
    where: { id: params.id },
    include: { game: true },
  })

  if (!session) {
    return {
      title: '约局不存在 - 桌游约局平台',
    }
  }

  return {
    title: `${session.title} - 桌游约局平台`,
    description: `${session.game.name} 桌游约局，时间：${session.startTime.toLocaleString('zh-CN')}，地点：${session.location}`,
  }
}

export default async function SessionDetailPage({
  params,
}: SessionDetailPageProps) {
  const session = await prisma.gameSession.findUnique({
    where: { id: params.id },
    include: {
      game: true,
      creator: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      registrations: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              averageRating: true,
              totalGames: true,
            },
          },
        },
      },
      playerReviews: {
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      gameReviews: {
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
      },
    },
  })

  if (!session) {
    notFound()
  }

  const currentUser = await getCurrentUser()

  return <SessionDetail session={session as any} currentUser={currentUser} />
}
