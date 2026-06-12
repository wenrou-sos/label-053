import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      select: {
        id: true,
        name: true,
        coverImage: true,
        minPlayers: true,
        maxPlayers: true,
        difficulty: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(games)
  } catch (error) {
    console.error('Get games error:', error)
    return NextResponse.json(
      { error: '获取桌游列表失败' },
      { status: 500 }
    )
  }
}
