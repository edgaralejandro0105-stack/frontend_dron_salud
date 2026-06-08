import { useState } from 'react'

export default function AreaChartSVG({ data, dataKey }) {
  const W = 600, H = 260, padL = 50, padR = 20, padT = 20, padB = 40
  const maxVal = Math.max(...data.map(d => d[dataKey]))
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const xs = data.map((_, i) => padL + (i / (data.length - 1)) * chartW)
  const ys = data.map(d => padT + (1 - d[dataKey] / maxVal) * chartH)

  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ')
  const areaPath = `${linePath} L${xs[xs.length - 1]},${H - padB} L${xs[0]},${H - padB} Z`

  const [hover, setHover] = useState(null)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = padT + t * chartH
        return <line key={i} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
      })}

      {[0, 0.5, 1].map((t, i) => {
        const y = padT + t * chartH
        const val = Math.round(maxVal * (1 - t))
        return <text key={i} x={padL - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#6b7280">{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}</text>
      })}

      {data.map((d, i) => (
        <text key={i} x={xs[i]} y={H - 6} textAnchor="middle" fontSize="11" fill="#6b7280">{d.name}</text>
      ))}

      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {data.map((d, i) => (
        <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
          <circle cx={xs[i]} cy={ys[i]} r="14" fill="transparent" />
          <circle cx={xs[i]} cy={ys[i]} r={hover === i ? 6 : 4} fill={hover === i ? '#1e3a8a' : '#fff'} stroke="#1e3a8a" strokeWidth="2.5" />
          {hover === i && (
            <g>
              <rect x={xs[i] - 34} y={ys[i] - 36} width="68" height="26" rx="6" fill="#1e3a8a" />
              <text x={xs[i]} y={ys[i] - 18} textAnchor="middle" fontSize="12" fontWeight="600" fill="#fff">{d[dataKey].toLocaleString()}</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  )
}
