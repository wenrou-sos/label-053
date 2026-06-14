import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface TrendDataPoint {
  label: string
  avg: number
  count: number
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateInviteCode(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  }
  return labels[difficulty] || difficulty
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400',
  }
  return colors[difficulty] || 'text-gray-400'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已结束',
    cancelled: '已取消',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    upcoming: 'bg-blue-500/20 text-blue-400',
    ongoing: 'bg-green-500/20 text-green-400',
    completed: 'bg-gray-500/20 text-gray-400',
    cancelled: 'bg-red-500/20 text-red-400',
  }
  return colors[status] || 'bg-gray-500/20 text-gray-400'
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return formatDate(date)
}

interface RawRating {
  overallRating: number
  createdAt: Date
}

function isValidRating(r: any): r is RawRating {
  if (!r) return false
  if (typeof r.overallRating !== 'number' || isNaN(r.overallRating)) return false
  const date = new Date(r.createdAt)
  return !isNaN(date.getTime())
}

function groupByKey(
  raw: RawRating[],
  getKey: (r: RawRating) => string,
  formatLabel: (key: string) => string,
): TrendDataPoint[] | null {
  const groups: Record<string, number[]> = {}
  for (const r of raw) {
    const key = getKey(r)
    if (!groups[key]) groups[key] = []
    groups[key].push(r.overallRating)
  }
  const keys = Object.keys(groups).sort()
  if (keys.length < 2) return null
  return keys.map((k) => {
    const arr = groups[k]
    return {
      label: formatLabel(k),
      avg: arr.reduce((s, v) => s + v, 0) / arr.length,
      count: arr.length,
    }
  })
}

function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

export function buildTrendData(raw: RawRating[]): TrendDataPoint[] {
  if (!raw || !Array.isArray(raw)) return []

  const validData = raw.filter(isValidRating).sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  if (validData.length < 2) return []

  const byMonth = groupByKey(
    validData,
    (r) => {
      const d = new Date(r.createdAt)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    },
    (k) => {
      const [y, m] = k.split('-')
      return `${y}/${m}`
    },
  )
  if (byMonth) return byMonth

  const byWeek = groupByKey(
    validData,
    (r) => getISOWeek(new Date(r.createdAt)),
    (k) => k.replace('-W', '年第').concat('周'),
  )
  if (byWeek) return byWeek

  const byDay = groupByKey(
    validData,
    (r) => {
      const d = new Date(r.createdAt)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
    (k) => {
      const [y, m, day] = k.split('-')
      return `${y}/${m}/${day}`
    },
  )
  if (byDay) return byDay

  return validData.map((r, i) => ({
    label: `第${i + 1}次`,
    avg: r.overallRating,
    count: 1,
  }))
}
