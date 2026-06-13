'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TrendDataPoint {
  label: string
  avg: number
  count: number
}

interface GameRatingTrendProps {
  data: TrendDataPoint[]
  maxValue?: number
}

export function GameRatingTrend({ data, maxValue = 5 }: GameRatingTrendProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-text-muted gap-2">
        <Minus className="w-10 h-10 opacity-40" />
        <p>暂无足够数据显示评分趋势</p>
        <p className="text-sm">至少需要 2 条评价来生成趋势</p>
      </div>
    )
  }

  const chartHeight = 200
  const chartWidth = 600
  const padding = { top: 30, right: 20, bottom: 50, left: 40 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  const barGap = 8
  const barWidth = data.length > 0 ? (innerWidth - (data.length - 1) * barGap) / data.length : 40

  const avgAll = data.reduce((s, d) => s + d.avg, 0) / data.length
  const first = data[0].avg
  const last = data[data.length - 1].avg
  const diff = last - first
  const trend = diff > 0.05 ? 'up' : diff < -0.05 ? 'down' : 'flat'

  const getX = (i: number) => padding.left + i * (barWidth + barGap)
  const getHeight = (v: number) => (v / maxValue) * innerHeight
  const getY = (v: number) => padding.top + innerHeight - getHeight(v)

  const gridY = [1, 2, 3, 4, 5]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {trend === 'up' && (
            <>
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">评分上升</span>
              <span className="text-text-muted text-sm">
                +{diff.toFixed(2)}
              </span>
            </>
          )}
          {trend === 'down' && (
            <>
              <TrendingDown className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">评分下降</span>
              <span className="text-text-muted text-sm">
                {diff.toFixed(2)}
              </span>
            </>
          )}
          {trend === 'flat' && (
            <>
              <Minus className="w-5 h-5 text-text-muted" />
              <span className="text-text-muted font-medium">评分稳定</span>
              <span className="text-text-muted text-sm">
                {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
              </span>
            </>
          )}
        </div>
        <div className="text-sm text-text-muted">
          期间平均分: <span className="text-text-primary font-semibold">{avgAll.toFixed(2)}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="min-w-full"
        >
          {gridY.map((v) => {
            const y = getY(v)
            return (
              <g key={v}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.06}
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-text-muted"
                  style={{ fontSize: 10 }}
                >
                  {v}
                </text>
              </g>
            )
          })}

          {data.map((d, i) => {
            const x = getX(i)
            const h = getHeight(d.avg)
            const y = getY(d.avg)

            let fill = 'rgb(139, 92, 246)'
            if (data.length >= 2) {
              if (i > 0 && d.avg > data[i - 1].avg) fill = 'rgb(34, 197, 94)'
              else if (i > 0 && d.avg < data[i - 1].avg) fill = 'rgb(239, 68, 68)'
            }

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  rx={4}
                  fill={fill}
                  fillOpacity={0.8}
                  className="transition-all duration-300"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="fill-text-primary font-semibold"
                  style={{ fontSize: 11 }}
                >
                  {d.avg.toFixed(1)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  className="fill-text-secondary"
                  style={{ fontSize: 11 }}
                >
                  {d.label}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding.bottom + 38}
                  textAnchor="middle"
                  className="fill-text-muted"
                  style={{ fontSize: 10 }}
                >
                  {d.count} 条
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
