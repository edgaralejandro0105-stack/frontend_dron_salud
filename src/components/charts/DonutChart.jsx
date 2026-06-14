import { useState } from 'react'

export default function DonutChart({ data, size = 200, innerRadius = 0.6 }) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 16
  const total = data.reduce((s, d) => s + d.valor, 0)
  const [hoverIndex, setHoverIndex] = useState(null)

  function polarToCartesian(cx, cy, radius, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  function describeArc(startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
  }

  let cumulative = 0
  const arcs = data.map((d) => {
    const angle = (d.valor / total) * 360
    const start = cumulative
    cumulative += angle
    return { ...d, startAngle: start, endAngle: cumulative, path: describeArc(start, cumulative) }
  })

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      <defs>
        {arcs.map((d, i) => (
          <clipPath key={i} id={`clip-${i}`}>
            <path d={d.path} />
          </clipPath>
        ))}
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={r * (1 - innerRadius)} />
      {arcs.map((d, i) => {
        const sw = r * (1 - innerRadius)
        const dashLen = (d.endAngle - d.startAngle) / 360 * 2 * Math.PI * r
        const gapLen = 2 * Math.PI * r - dashLen
        const offset = d.startAngle / 360 * 2 * Math.PI * r
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r - sw / 2}
            fill="none"
            stroke={d.color}
            strokeWidth={sw}
            strokeDasharray={`${dashLen * 0.85} ${gapLen + dashLen * 0.15}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{ cursor: 'pointer', opacity: hoverIndex === null || hoverIndex === i ? 1 : 0.35, transition: 'opacity 0.2s' }}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        )
      })}
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize="20" fontWeight="700" fill="#111827">{total}</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fontSize="10" fontWeight="500" fill="#9ca3af">Total</text>
    </svg>
  )
}
