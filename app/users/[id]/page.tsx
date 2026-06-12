import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { UserProfile } from '@/components/UserProfile'

interface UserPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params,
}: UserPageProps): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
  })

  if (!user) {
    return {
      title: '用户不存在 - 桌游约局平台',
    }
  }

  return {
    title: `${user.username} 的主页 - 桌游约局平台`,
    description: `${user.username} 的桌游主页，查看游戏历史、评价和收藏`,
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
  })

  if (!user) {
    notFound()
  }

  const currentUser = await getCurrentUser()

  const sessions = await prisma.gameSession.findMany({
    where: {
      registrations: {
        some: {
          userId: user.id,
          status: 'approved',
        },
      },
    },
    include: {
      game: {
        select: {
          id: true,
          name: true,
          coverImage: true,
        },
      },
      creator: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          registrations: {
            where: { status: 'approved' },
          },
        },
      },
    },
    orderBy: {
      startTime: 'desc',
    },
  })

  const reviewsReceived = await prisma.playerReview.findMany({
    where: { revieweeId: user.id },
    include: {
      reviewer: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      session: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const favorites = await prisma.favorite
    .findMany({
      where: { userId: user.id },
      include: { game: true },
      orderBy: { createdAt: 'desc' },
    })
    .then((favs) => favs.map((f) => f.game))

  return (
    <UserProfile
      user={user as any}
      currentUserId={currentUser?.id || null}
      sessions={sessions as any}
      reviewsReceived={reviewsReceived as any}
      favorites={favorites as any}
    />
  )
}
