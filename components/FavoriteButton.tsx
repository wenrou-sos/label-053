'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toggleFavorite } from '@/lib/actions'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  gameId: string
  initialFavorited?: boolean
  variant?: 'card' | 'detail' | 'icon'
  className?: string
}

export default function FavoriteButton({
  gameId,
  initialFavorited = false,
  variant = 'icon',
  className,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      const prev = isFavorited
      setIsFavorited(!prev)
      const result = await toggleFavorite(gameId)
      if (result?.success) {
        setIsFavorited(result.isFavorited)
      } else {
        setIsFavorited(prev)
      }
    })
  }

  const variantStyles = {
    card: 'w-9 h-9 p-2 bg-background/80 backdrop-blur-sm hover:bg-background/90',
    detail: 'w-11 h-11 p-3',
    icon: '',
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        'rounded-full transition-all duration-200',
        variantStyles[variant],
        isFavorited
          ? 'text-danger hover:text-danger hover:bg-danger/10'
          : 'text-text-secondary hover:text-danger hover:bg-danger/10',
        className
      )}
      aria-label={isFavorited ? '取消收藏' : '收藏'}
    >
      <Heart
        className={cn(
          'w-5 h-5 transition-transform duration-200',
          isFavorited && 'fill-current',
          isPending && 'animate-pulse'
        )}
      />
    </Button>
  )
}
