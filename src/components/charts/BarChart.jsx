import { useState } from 'react'

export default function BarChartSVG({ data, dataKey }) {
  const W = 400, H = 260, padL = 50, padR = 20, padT = 20, padB = 40
  const maxVal = Math.max(...data.map(d => d[dataKey]))
  const chartH = H - padT - padB
  const barW = 32
  const gap = (W - padL - padR - data.length * barW) / (data.length + 1)
  const blues = ['#1e3a8a', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa']

  const [hover, setHover] = useState(null)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = padT + t * chartH
        return <line key={i} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
      })}

      {[0, 0.5, 1].map((t, i) => {
        const y = padT + t * chartH
        const val = Math.round(maxVal * (1 - t))
        return <text key={i} x={padL - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#6b7280">{val}</text>
      })}

      {data.map((d, i) => {
        const barH = (d[dataKey] / maxVal) * chartH
        const x = padL + gap + i * (barW + gap)
        const y = padT + chartH - barH
        return (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
            <rect x={x} y={y} width={barW} height={barH} rx="5" fill={hover === i ? '#1e3a8a' : blues[i]} opacity={hover === i ? 1 : 0.85} />
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#6b7280">{d.name}</text>
            {hover === i && (
              <g>
                <rect x={x + barW / 2 - 26} y={y - 32} width="52" height="24" rx="6" fill="#1e3a8a" />
                <text x={x + barW / 2} y={y - 15} textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">{d[dataKey]}</text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
