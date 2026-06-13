'use client'

interface RadarDimension {
  label: string
  value: number
  color: string
}

interface GameRatingRadarProps {
  dimensions: RadarDimension[]
  size?: number
  maxValue?: number
}

export function GameRatingRadar({
  dimensions,
  size = 280,
  maxValue = 5,
}: GameRatingRadarProps) {
  const center = size / 2
  const radius = size / 2 - 40
  const count = dimensions.length

  if (count < 3) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        数据不足
      </div>
    )
  }

  const angleStep = (Math.PI * 2) / count
  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2
    const r = (value / maxValue) * radius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  }

  const getLabelPoint = (index: number) => {
    const angle = angleStep * index - Math.PI / 2
    const r = radius + 24
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  }

  const gridLevels = [0.25, 0.5, 0.75, 1]

  const polygonPoints = dimensions
    .map((d, i) => {
      const p = getPoint(i, d.value || 0)
      return `${p.x},${p.y}`
    })
    .join(' ')

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {gridLevels.map((level, li) => {
          const points = dimensions
            .map((_, i) => {
              const angle = angleStep * i - Math.PI / 2
              const r = level * radius
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
            })
            .join(' ')
          return (
            <polygon
              key={li}
              points={points}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          )
        })}

        {dimensions.map((_, i) => {
          const p = getPoint(i, maxValue)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
          )
        })}

        <polygon
          points={polygonPoints}
          fill="rgba(139, 92, 246, 0.25)"
          stroke="rgb(139, 92, 246)"
          strokeWidth={2}
        />

        {dimensions.map((d, i) => {
          const p = getPoint(i, d.value || 0)
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="rgb(139, 92, 246)"
              stroke="rgb(15, 15, 20)"
              strokeWidth={2}
            />
          )
        })}

        {dimensions.map((d, i) => {
          const lp = getLabelPoint(i)
          const vp = getPoint(i, d.value || 0)
          return (
            <g key={i}>
              <text
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-text-secondary"
                style={{ fontSize: 13 }}
              >
                {d.label}
              </text>
              <text
                x={vp.x}
                y={vp.y - 12}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-text-primary font-semibold"
                style={{ fontSize: 12 }}
              >
                {(d.value || 0).toFixed(1)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
