import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { SessionDetail } from '@/components/SessionDetail'
import type { Metadata } from 'next'

interface InvitePageProps {
  params: {
    code: string
  }
}

export async function generateMetadata({
  params,
}: InvitePageProps): Promise<Metadata> {
  const session = await prisma.gameSession.findUnique({
    where: { inviteCode: params.code.toUpperCase() },
    include: { game: true },
  })

  if (!session) {
    return {
      title: '邀请码无效 - 桌游约局平台',
    }
  }

  return {
    title: `邀请：${session.title} - 桌游约局平台`,
    description: `邀请你参加「${session.game.name}」桌游约局，时间：${session.startTime.toLocaleString('zh-CN')}，地点：${session.location}`,
  }
}

export default async function InvitePage({ params }: InvitePageProps) {
  const session = await prisma.gameSession.findUnique({
    where: { inviteCode: params.code.toUpperCase() },
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
