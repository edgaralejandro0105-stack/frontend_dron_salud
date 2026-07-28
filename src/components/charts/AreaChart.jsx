import { useState, useRef } from 'react'

function smoothPath(pts) {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i]
    d += ` C${p.x + (c.x - p.x) / 3},${p.y} ${p.x + ((c.x - p.x) / 3) * 2},${c.y} ${c.x},${c.y}`
  }
  return d
}

export default function AreaChartSVG({
  data,
  dataKey,
  color = '#6366f1',
  color2 = '#8b5cf6',
  color3 = '#06b6d4',
  height = 280,
}) {
  const W = 640, H = height, padL = 48, padR = 24, padT = 32, padB = 44
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const maxVal = data.length > 0 ? Math.max(...data.map((d) => d[dataKey])) : 0
  const [hover, setHover] = useState(null)
  const svgRef = useRef(null)

  if (data.length === 0 || maxVal === 0) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="13" fill="#94a3b8" fontFamily="Inter, sans-serif" fontWeight={500}>
          Sin datos disponibles
        </text>
      </svg>
    )
  }

  const points = data.map((d, i) => ({
    x: padL + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padT + (1 - d[dataKey] / maxVal) * chartH,
    ...d,
  }))

  const lineD = smoothPath(points)
  const areaD = `${lineD} L${points[points.length - 1].x},${H - padB} L${points[0].x},${H - padB} Z`

  const ySteps = [0, 0.25, 0.5, 0.75, 1]
  const gradientId = `areaGrad-${dataKey}`
  const glowId = `glow-${dataKey}`
  const lineGradId = `lineGrad-${dataKey}`
  const dotGlowId = `dotGlow-${dataKey}`

  const handleHover = (i) => {
    setHover(i)
  }

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3">
            <animate attributeName="stopOpacity" values="0.3;0.45;0.3" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="40%" stopColor={color2} stopOpacity="0.1" />
          <stop offset="100%" stopColor={color3} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id={lineGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color3} />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={dotGlowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="tooltipShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgb(0,0,0)" floodOpacity="0.25" />
        </filter>
        <clipPath id={`clip-${dataKey}`}>
          <rect x={padL} y={0} width={chartW} height={H} />
        </clipPath>
      </defs>

      <g opacity="0.18">
        {ySteps.map((t, i) => {
          const y = padT + t * chartH
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 6" />
              <circle cx={padL} cy={y} r="2.5" fill="#cbd5e1" />
              <circle cx={W - padR} cy={y} r="2.5" fill="#cbd5e1" />
            </g>
          )
        })}
      </g>

      {ySteps.map((t, i) => {
        const y = padT + t * chartH
        const val = Math.round(maxVal * (1 - t))
        const display = val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(val)
        return (
          <text key={`y-${i}`} x={padL - 12} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight={500} fontFamily="Inter, sans-serif" letterSpacing="0.02em">
            {display}
          </text>
        )
      })}

      {data.map((d, i) => (
        <g key={`x-${i}`}>
          <text x={points[i].x} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight={500} fontFamily="Inter, sans-serif" letterSpacing="0.02em">
            {d.name}
          </text>
          <circle cx={points[i].x} cy={H - padB} r="1.5" fill="#cbd5e1" />
        </g>
      ))}

      <g clipPath={`url(#clip-${dataKey})`}>
        <path d={areaD} fill={`url(#${gradientId})`}>
          <animate attributeName="opacity" values="0.85;1;0.85" dur="5s" repeatCount="indefinite" />
        </path>
      </g>

      <path d={lineD} fill="none" stroke={`url(#${lineGradId})`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${glowId})`} />
      <path d={lineD} fill="none" stroke={`url(#${lineGradId})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {hover !== null && (
        <line
          x1={points[hover].x} y1={padT} x2={points[hover].x} y2={H - padB}
          stroke={`url(#${lineGradId})`} strokeWidth="1" strokeDasharray="3 4" opacity="0.5"
        />
      )}

      {points.map((p, i) => {
        const isActive = hover === i
        const isNear = hover !== null && Math.abs(hover - i) <= 1
        const r = isActive ? 7 : isNear ? 4.5 : 0
        return (
          <g key={i} onMouseEnter={() => handleHover(i)} onMouseLeave={() => handleHover(null)} style={{ cursor: 'pointer' }}>
            <circle cx={p.x} cy={p.y} r="22" fill="transparent" />
            {/* outer pulse ring */}
            {isActive && (
              <circle cx={p.x} cy={p.y} r="10" fill="none" stroke={color2} strokeWidth="1.5" opacity="0.4">
                <animate attributeName="r" values="7;16" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            {/* glow under dot */}
            {isActive && (
              <circle cx={p.x} cy={p.y} r="12" fill={color} opacity="0.15">
                <animate attributeName="r" values="8;14" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.05" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            {/* main dot */}
            <circle cx={p.x} cy={p.y} r={r} fill="#fff" stroke={`url(#${lineGradId})`} strokeWidth={isActive ? 3.5 : 2.5} filter={isActive ? `url(#${dotGlowId})` : undefined} style={{ transition: 'r 0.3s ease, stroke-width 0.3s ease' }} />
            {/* inner dot */}
            {isActive && <circle cx={p.x} cy={p.y} r="2.5" fill={color} />}

            {isActive && (
              <g filter="url(#tooltipShadow)">
                <rect
                  x={Math.max(padL - 8, Math.min(p.x - 52, W - padR - 104))}
                  y={p.y - 56}
                  width="104"
                  height="42"
                  rx="12"
                  fill="#fff"
                  opacity="0.98"
                />
                <text
                  x={Math.max(padL - 8, Math.min(p.x - 52, W - padR - 104)) + 52}
                  y={p.y - 31}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill="#1e293b"
                  fontFamily="'Plus Jakarta Sans', Inter, sans-serif"
                >
                  {p[dataKey].toLocaleString()} envíos
                </text>
                <text
                  x={Math.max(padL - 8, Math.min(p.x - 52, W - padR - 104)) + 52}
                  y={p.y - 48}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill={color}
                  fontFamily="Inter, sans-serif"
                  letterSpacing="0.05em"
                >
                  {p.name.toUpperCase()}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
