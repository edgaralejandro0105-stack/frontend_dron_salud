import { useState } from 'react'

function smoothPoints(points) {
  if (points.length < 2) return ''
  let d = `M${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx1 = prev.x + (curr.x - prev.x) / 3
    const cpy1 = prev.y
    const cpx2 = prev.x + ((curr.x - prev.x) / 3) * 2
    const cpy2 = curr.y
    d += ` C${cpx1},${cpy1} ${cpx2},${cpy2} ${curr.x},${curr.y}`
  }
  return d
}

export default function AreaChartSVG({ data, dataKey, color = '#2563eb' }) {
  const W = 600, H = 260, padL = 50, padR = 20, padT = 20, padB = 40
  const maxVal = Math.max(...data.map(d => d[dataKey]))
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const points = data.map((d, i) => ({
    x: padL + (i / (data.length - 1)) * chartW,
    y: padT + (1 - d[dataKey] / maxVal) * chartH,
    ...d,
  }))

  const linePath = smoothPoints(points)
  const areaPath = `${linePath} L${points[points.length - 1].x},${H - padB} L${points[0].x},${H - padB} Z`

  const [hover, setHover] = useState(null)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="40%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="shadowTooltip">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={color} floodOpacity="0.25" />
        </filter>
      </defs>

      <g opacity="0.5">
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = padT + t * chartH
          return <line key={i} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 4" />
        })}
      </g>

      {[0, 0.5, 1].map((t, i) => {
        const y = padT + t * chartH
        const val = Math.round(maxVal * (1 - t))
        return (
          <text key={i} x={padL - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af" fontFamily="Inter, sans-serif">
            {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
          </text>
        )
      })}

      {data.map((d, i) => (
        <text key={i} x={points[i].x} y={H - 6} textAnchor="middle" fontSize="11" fill="#9ca3af" fontFamily="Inter, sans-serif">
          {d.name}
        </text>
      ))}

      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />

      {points.map((p, i) => (
        <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
          <circle cx={p.x} cy={p.y} r="18" fill="transparent" />
          <circle
            cx={p.x} cy={p.y}
            r={hover === i ? 6 : 3}
            fill={hover === i ? '#fff' : color}
            stroke={color}
            strokeWidth={hover === i ? 3 : 2}
            style={{ transition: 'r 0.2s, stroke-width 0.2s' }}
          />
          {hover === i && (
            <g filter="url(#shadowTooltip)">
              <rect x={p.x - 36} y={p.y - 40} width="72" height="28" rx="8" fill={color} opacity="0.95" />
              <text x={p.x} y={p.y - 21} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif">
                {p[dataKey].toLocaleString()}
              </text>
              <text x={p.x} y={p.y - 32} textAnchor="middle" fontSize="8" fontWeight="500" fill="rgba(255,255,255,0.7)" fontFamily="Inter, sans-serif">
                {p.name}
              </text>
            </g>
          )}
          {hover === i && (
            <line x1={p.x} y1={p.y} x2={p.x} y2={H - padB} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          )}
        </g>
      ))}
    </svg>
  )
}
