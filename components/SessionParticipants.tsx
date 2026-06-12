'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { User } from '@/types'

interface ParticipantWithStatus {
  user: Pick<User, 'id' | 'username' | 'avatar' | 'averageRating' | 'totalGames'>
  status: string
  isCreator?: boolean
}

interface SessionParticipantsProps {
  participants: ParticipantWithStatus[]
  maxPlayers: number
  showRating?: boolean
}

export function SessionParticipants({ participants, maxPlayers, showRating = true }: SessionParticipantsProps) {
  const approvedParticipants = participants.filter(p => p.status === 'approved')
  const remainingSlots = maxPlayers - approvedParticipants.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary">
          参与者 ({approvedParticipants.length}/{maxPlayers})
        </h3>
        {remainingSlots > 0 && (
          <Badge variant="primary">
            剩余 {remainingSlots} 个名额
          </Badge>
        )}
        {remainingSlots === 0 && (
          <Badge variant="danger">
            已满员
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {approvedParticipants.map(({ user, isCreator }) => (
          <Link
            key={user.id}
            href={`/users/${user.id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-card-hover transition-all duration-200 group"
          >
            <div className="relative flex-shrink-0">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={user.username}
                className="w-12 h-12 rounded-full bg-background border-2 border-border group-hover:border-primary/50 transition-colors"
              />
              {isCreator && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full border-2 border-background">
                  主持人
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                  {user.username}
                </p>
              </div>
              {showRating && (
                <div className="flex items-center gap-3 text-sm text-text-secondary mt-1">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{user.averageRating > 0 ? user.averageRating.toFixed(1) : '暂无'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{user.totalGames} 局</span>
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}

        {Array.from({ length: remainingSlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border"
          >
            <div className="w-12 h-12 rounded-full bg-card border-2 border-dashed border-border flex items-center justify-center">
              <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-text-muted text-sm">
              虚位以待
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
