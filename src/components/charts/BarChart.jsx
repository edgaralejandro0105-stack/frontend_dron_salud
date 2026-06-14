import { useState } from 'react'

const gradients = [
  { from: '#2563eb', to: '#1d4ed8' },
  { from: '#059669', to: '#047857' },
  { from: '#d97706', to: '#b45309' },
  { from: '#7c3aed', to: '#6d28d9' },
  { from: '#dc2626', to: '#b91c1c' },
]

export default function BarChartSVG({ data, dataKey, labelKey = 'name' }) {
  const W = 420, H = 240, padL = 50, padR = 20, padT = 20, padB = 40
  const maxVal = Math.max(...data.map(d => d[dataKey]))
  const chartH = H - padT - padB
  const barW = 38
  const gap = (W - padL - padR - data.length * barW) / (data.length + 1)

  const [hover, setHover] = useState(null)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        {gradients.map((g, i) => (
          <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={g.from} stopOpacity="0.85" />
            <stop offset="100%" stopColor={g.to} stopOpacity="1" />
          </linearGradient>
        ))}
        <filter id="barShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.1)" />
        </filter>
        <filter id="tooltipShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.15)" />
        </filter>
      </defs>

      <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#e5e7eb" strokeWidth="1" />

      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = padT + t * chartH
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth="1" />
            <text x={padL - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af" fontFamily="Inter, sans-serif">
              {Math.round(maxVal * (1 - t))}
            </text>
          </g>
        )
      })}

      {data.map((d, i) => {
        const barH = (d[dataKey] / maxVal) * chartH
        const x = padL + gap + i * (barW + gap)
        const y = padT + chartH - barH
        const isHover = hover === i
        const gi = i % gradients.length

        return (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
            {isHover && (
              <rect
                x={x - 3} y={padT + chartH - barH - 3}
                width={barW + 6} height={barH + 6}
                rx="7" fill="none" stroke={gradients[gi].from}
                strokeWidth="2" strokeDasharray="4 3"
                opacity="0.4"
              />
            )}
            <rect
              x={x} y={y}
              width={barW} height={barH}
              rx="5"
              fill={`url(#barGrad${gi})`}
              filter={isHover ? 'url(#barShadow)' : undefined}
              style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
              transform={isHover ? `translate(0, -2)` : 'translate(0, 0)'}
            />
            <text
              x={x + barW / 2} y={H - 6}
              textAnchor="middle" fontSize="10" fontWeight="500"
              fill={isHover ? '#1f2937' : '#6b7280'}
              fontFamily="Inter, sans-serif"
            >
              {d[labelKey]}
            </text>
            {isHover && (
              <g filter="url(#tooltipShadow)">
                <rect x={x + barW / 2 - 30} y={y - 36} width="60" height="26" rx="7" fill="#1f2937" opacity="0.95" />
                <text x={x + barW / 2} y={y - 18} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif">
                  {d[dataKey]}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
