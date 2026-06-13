'use client'

import { useState, useTransition } from 'react'
import { Send, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { createSessionMessage } from '@/lib/actions'
import { cn } from '@/lib/utils'

interface SessionMessageFormProps {
  sessionId: string
  canPost: boolean
  className?: string
}

export function SessionMessageForm({ sessionId, canPost, className }: SessionMessageFormProps) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!canPost) {
    return (
      <div className={cn('p-6 rounded-xl bg-card/40 border border-border/50 text-center', className)}>
        <MessageSquare className="w-8 h-8 mx-auto text-text-muted mb-2" />
        <p className="text-text-muted text-sm">只有约局参与者才能留言</p>
        <p className="text-text-muted/70 text-xs mt-1">先报名加入约局，就可以和大家一起讨论啦</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!content.trim() || isPending) return

    setError('')
    setSuccess('')

    startTransition(async () => {
      const result = await createSessionMessage(sessionId, content.trim())
      if (result.error) {
        setError(result.message || '留言失败')
      } else {
        setContent('')
        setSuccess('留言成功！')
        setTimeout(() => setSuccess(''), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      <div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="说点什么... 讨论战术、确认时间、分享经验都可以（最多1000字）"
          rows={3}
          maxLength={1000}
          disabled={isPending}
          className="resize-none"
        />
        <div className="flex justify-between items-center mt-1.5">
          <div className="flex items-center gap-2 min-h-[20px]">
            {error && (
              <p className="text-xs text-danger flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
            {success && (
              <p className="text-xs text-success flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {success}
              </p>
            )}
          </div>
          <span className={cn(
            'text-xs tabular-nums',
            content.length > 900 ? 'text-danger' : content.length > 700 ? 'text-warning' : 'text-text-muted'
          )}>
            {content.length}/1000
          </span>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending || !content.trim()}
          loading={isPending}
        >
          <Send className="w-4 h-4" />
          发送留言
        </Button>
      </div>
    </form>
  )
}

export default SessionMessageForm
