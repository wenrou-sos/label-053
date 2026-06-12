'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  name?: string
  form?: string
  className?: string
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  name,
  form,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)
  const displayValue = hoverValue || value

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={readOnly ? 'button' : 'button'}
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHoverValue(star)}
          onMouseLeave={() => !readOnly && setHoverValue(0)}
          className={cn(
            'transition-transform duration-150',
            !readOnly && 'cursor-pointer hover:scale-110',
            readOnly && 'cursor-default'
          )}
        >
          <Star
            className={cn(
              sizeMap[size],
              'transition-colors duration-150',
              star <= displayValue
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-border'
            )}
          />
        </button>
      ))}
      {name && (
        <input type="hidden" name={name} value={value} form={form} />
      )}
    </div>
  )
}

export default StarRating
