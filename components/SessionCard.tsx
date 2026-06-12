'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn, formatDateTime, getStatusLabel } from '@/lib/utils'
import type { GameSession, Game, User } from '@/types'

interface SessionCardProps {
  session: GameSession & {
    game: Pick<Game, 'id' | 'name' | 'coverImage'>
    creator: Pick<User, 'id' | 'username' | 'avatar'>
    _count?: {
      registrations: number
    }
  }
  currentUserId?: string
}

export function SessionCard({ session, currentUserId }: SessionCardProps) {
  const isCreator = currentUserId === session.creatorId
  const participantCount = session._count?.registrations ?? 0
  const isFull = participantCount >= session.maxPlayers

  const statusVariant = (() => {
    switch (session.status) {
      case 'upcoming': return 'primary'
      case 'ongoing': return 'success'
      case 'completed': return 'secondary'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  })()

  return (
    <Link href={`/sessions/${session.id}`} className="block group">
      <Card className="h-full flex flex-col group-hover:border-primary/50 group-hover:-translate-y-1">
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
          <img
            src={session.game.coverImage}
            alt={session.game.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={statusVariant as any}>
              {getStatusLabel(session.status)}
            </Badge>
            {!session.isPublic && (
              <Badge variant="warning">
                私密
              </Badge>
            )}
            {isCreator && (
              <Badge variant="success">
                我创建的
              </Badge>
            )}
          </div>
          {isFull && session.status === 'upcoming' && (
            <div className="absolute top-3 right-3">
              <Badge variant="danger">
                已满员
              </Badge>
            </div>
          )}
        </div>

        <CardHeader>
          <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
            {session.title}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
            <span>{session.game.name}</span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          <div className="flex items-start gap-2 text-sm text-text-secondary">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatDateTime(session.startTime)}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-text-secondary">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{session.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className={cn(
              'font-medium',
              isFull ? 'text-danger' : 'text-text-primary'
            )}>
              {participantCount}/{session.maxPlayers} 人
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="flex items-center gap-2">
            <img
              src={session.creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.creator.username}`}
              alt={session.creator.username}
              className="w-6 h-6 rounded-full bg-card"
            />
            <span className="text-sm text-text-secondary">{session.creator.username}</span>
          </div>
          <Button size="sm" variant="ghost" onClick={(e) => { e.preventDefault(); window.location.href = `/sessions/${session.id}` }}>
            查看详情
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
