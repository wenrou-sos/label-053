'use client'

import { useState, useEffect } from 'react'
import { Bell, Calendar, Check, Users, XCircle, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { markNotificationRead } from '@/lib/actions'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  content: string
  read: boolean
  createdAt: Date
}

interface NotificationListProps {
  notifications: Notification[]
  className?: string
}

const typeIcons: Record<string, typeof Bell> = {
  join: Users,
  cancel: XCircle,
  review: MessageSquare,
  default: Bell,
}

const typeVariants: Record<string, 'primary' | 'danger' | 'success' | 'warning' | 'secondary'> = {
  join: 'success',
  cancel: 'danger',
  review: 'primary',
  default: 'secondary',
}

export function NotificationList({ notifications, className }: NotificationListProps) {
  const [items, setItems] = useState<Notification[]>(notifications)
  const [markingId, setMarkingId] = useState<string | null>(null)

  useEffect(() => {
    setItems(notifications)
  }, [notifications])

  const unreadCount = items.filter(n => !n.read).length

  const handleMarkRead = async (id: string) => {
    if (items.find(n => n.id === id)?.read) return
    setMarkingId(id)
    try {
      const result = await markNotificationRead(id)
      if (result.success) {
        setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      }
    } catch (error) {
      console.error('Mark notification read error:', error)
    } finally {
      setMarkingId(null)
    }
  }

  const handleMarkAllRead = async () => {
    const unreadIds = items.filter(n => !n.read).map(n => n.id)
    for (const id of unreadIds) {
      await handleMarkRead(id)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            通知
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium bg-danger text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              全部已读
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">暂无通知</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((notification) => {
              const Icon = typeIcons[notification.type] || typeIcons.default
              const variant = typeVariants[notification.type] || typeVariants.default
              return (
                <div
                  key={notification.id}
                  onClick={() => handleMarkRead(notification.id)}
                  className={cn(
                    'relative p-4 rounded-xl border transition-all duration-200 cursor-pointer group',
                    notification.read
                      ? 'bg-background border-border'
                      : 'bg-card border-primary/30 hover:border-primary/50'
                  )}
                >
                  {!notification.read && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-danger rounded-full animate-pulse" />
                  )}
                  <div className="flex gap-3">
                    <div className={cn(
                      'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
                      variant === 'success' && 'bg-success/20 text-success',
                      variant === 'danger' && 'bg-danger/20 text-danger',
                      variant === 'primary' && 'bg-primary/20 text-primary',
                      variant === 'warning' && 'bg-warning/20 text-warning',
                      variant === 'secondary' && 'bg-secondary/20 text-secondary'
                    )}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm leading-relaxed',
                        notification.read ? 'text-text-secondary' : 'text-text-primary font-medium'
                      )}>
                        {notification.content}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-text-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(notification.createdAt).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkRead(notification.id)
                        }}
                        loading={markingId === notification.id}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default NotificationList
