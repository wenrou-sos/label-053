'use client'

import Link from 'next/link'
import { MessageSquare, Calendar, Clock, Crown } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { SessionMessage } from '@/types'
import { Badge } from '@/components/ui/Badge'

interface SessionMessageListProps {
  messages: SessionMessage[]
  creatorId: string
  className?: string
}

export function SessionMessageList({ messages, creatorId, className }: SessionMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <MessageSquare className="w-12 h-12 mx-auto text-text-muted mb-3" />
        <p className="text-text-muted">还没有留言</p>
        <p className="text-sm text-text-muted/70 mt-1">参与者可以在这里讨论战术、确认时间</p>
      </div>
    )
  }

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  return (
    <div className={cn('space-y-3', className)}>
      {sortedMessages.map((message) => {
        const isCreator = message.userId === creatorId
        return (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 p-4 rounded-xl transition-all',
              'bg-card/60 border border-border/50 hover:bg-card hover:border-border'
            )}
          >
            <Link
              href={`/users/${message.userId}`}
              className="shrink-0 hover:opacity-80 transition-opacity"
            >
              <img
                src={message.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.user?.username || message.userId}`}
                alt={message.user?.username || '用户'}
                className="w-10 h-10 rounded-full bg-background"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/users/${message.userId}`}
                  className="font-medium text-text-primary hover:text-primary transition-colors"
                >
                  {message.user?.username || '用户'}
                </Link>
                {isCreator && (
                  <Badge variant="warning" className="text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    发起人
                  </Badge>
                )}
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(new Date(message.createdAt))}
                </span>
                <span className="text-xs text-text-muted/60 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(message.createdAt).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="mt-2 text-text-secondary text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SessionMessageList
