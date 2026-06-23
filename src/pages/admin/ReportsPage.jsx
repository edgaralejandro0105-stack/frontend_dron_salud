import { useState, useMemo, useEffect } from 'react'
import { getPedidos, getDrones, getFarmacias, getOperadores } from '../../api'

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Donut({ segments, size = 120, strokeWidth = 18 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let offset = 0
  return (
    <svg width={size} height={size} className="-rotate-90">
      {segments.map((seg, i) => {
        const pct = seg.value / total
        const length = pct * circumference
        const dashOffset = -offset
        offset += length
        return (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={seg.color} strokeWidth={strokeWidth}
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        )
      })}
    </svg>
  )
}

function MiniBar({ value, max, label, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-20 text-right text-gray-500 font-medium truncate text-xs">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${Math.max(pct, 1)}%` }} />
      </div>
      <span className="w-10 text-right font-bold text-gray-800 text-xs">{value}</span>
    </div>
  )
}

function StatCard({ icon, value, label, sub, color, badge }) {
  return (
    <div className="relative bg-white rounded-3xl border border-gray-100 p-5 shadow-[0_4px_24px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgb(0,0,0,0.08)] transition-all duration-300">
      {badge && (
        <span className="absolute -top-2 -right-2 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg">{badge}</span>
      )}
      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shadow-black/5 mb-3`}>
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
      <div className="text-xs font-semibold text-gray-500 mt-1">{label}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function ReportsPage() {
  const [pedidos, setPedidos] = useState([])
  const [drones, setDrones] = useState([])
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')
  const [exportando, setExportando] = useState(false)

  useEffect(() => {
    Promise.all([getPedidos(), getDrones(), getFarmacias(), getOperadores()])
      .then(([p, d]) => {
        if (Array.isArray(p)) setPedidos(p)
        else if (p?.pedidos) setPedidos(p.pedidos)
        if (Array.isArray(d)) setDrones(d)
        else if (d?.drones) setDrones(d.drones)
      })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    let items = [...pedidos]
    if (filtroDesde) {
      const d = new Date(filtroDesde)
      items = items.filter(o => new Date(o.fecha_creacion) >= d)
    }
    if (filtroHasta) {
      const d = new Date(filtroHasta)
      d.setHours(23, 59, 59)
      items = items.filter(o => new Date(o.fecha_creacion) <= d)
    }
    return items
  }, [pedidos, filtroDesde, filtroHasta])

  const entregadosConTiempo = useMemo(() => {
    return filtered.filter(o => o.estado_pedido === 'Entregado' && o.timestamp_inicio && o.timestamp_fin)
  }, [filtered])

  const totalEntregadosConTiempo = entregadosConTiempo.length

  const stats = useMemo(() => {
    const entregados = filtered.filter(o => o.estado_pedido === 'Entregado')
    const enTransito = filtered.filter(o => o.estado_pedido === 'En transito')
    const asignados = filtered.filter(o => o.id_dron)

    let tiempoPromedio = null, tiempoMin = null, tiempoMax = null
    if (entregadosConTiempo.length > 0) {
      const tiempos = entregadosConTiempo.map(o => (new Date(o.timestamp_fin) - new Date(o.timestamp_inicio)) / 60000)
      tiempoPromedio = Math.round(tiempos.reduce((s, t) => s + t, 0) / tiempos.length)
      tiempoMin = Math.round(Math.min(...tiempos))
      tiempoMax = Math.round(Math.max(...tiempos))
    }

    const operadorCounts = {}
    for (const o of asignados) {
      const nombre = o.operador?.usuario ? `${o.operador.usuario.nombre} ${o.operador.usuario.apellido || ''}`.trim() : `#${o.id_operador || '?'}`
      operadorCounts[nombre] = (operadorCounts[nombre] || 0) + 1
    }
    const topOperadores = Object.entries(operadorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

    const dronCounts = {}
    for (const o of asignados) {
      const modelo = o.dron?.modelo || `#${o.id_dron}`
      dronCounts[modelo] = (dronCounts[modelo] || 0) + 1
    }
    const topDrones = Object.entries(dronCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

    const pedidosPorEstado = {}
    for (const o of filtered) pedidosPorEstado[o.estado_pedido] = (pedidosPorEstado[o.estado_pedido] || 0) + 1

    const entregasHoy = entregados.filter(o => new Date(o.fecha_creacion).toDateString() === new Date().toDateString()).length

    const activos = drones.filter(d => d.estado_operativo === 'Activo' || d.estado_operativo === 'Transito').length
    const dronUtilizacion = drones.length > 0 ? Math.round((activos / drones.length) * 100) : 0

    const tiemposRangos = [0, 0, 0, 0, 0]
    for (const o of entregadosConTiempo) {
      const min = (new Date(o.timestamp_fin) - new Date(o.timestamp_inicio)) / 60000
      if (min < 15) tiemposRangos[0]++
      else if (min < 30) tiemposRangos[1]++
      else if (min < 45) tiemposRangos[2]++
      else if (min < 60) tiemposRangos[3]++
      else tiemposRangos[4]++
    }

    return {
      totalAsignados: asignados.length,
      totalEntregados: entregados.length,
      entregadosHoy: entregasHoy,
      enTransito: enTransito.length,
      tasaExito: filtered.length > 0 ? Math.round((entregados.length / filtered.length) * 100) : 0,
      tiempoPromedio, tiempoMin, tiempoMax,
      topOperadores, topDrones,
      pedidosPorEstado, dronUtilizacion,
      tiemposRangos
    }
  }, [filtered, drones, entregadosConTiempo])

  const donutSegments = useMemo(() => {
    const map = {
      Entregado: '#34d399', 'En transito': '#818cf8',
      Preparado: '#38bdf8', Pagado: '#60a5fa',
      Pendiente: '#fbbf24', Cancelado: '#9ca3af',
    }
    return Object.entries(stats.pedidosPorEstado)
      .filter(([_, v]) => v > 0)
      .map(([estado, value]) => ({ label: estado, value, color: map[estado] || '#e5e7eb' }))
  }, [stats.pedidosPorEstado])

  const rangoLabels = ['< 15min', '15-30min', '30-45min', '45-60min', '> 60min']
  const rangoColors = [
    'from-emerald-300 to-emerald-400',
    'from-emerald-400 to-emerald-500',
    'from-amber-400 to-amber-500',
    'from-orange-400 to-orange-500',
    'from-red-400 to-red-500',
  ]

  function handleExport() {
    setExportando(true)
    setTimeout(() => setExportando(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Reporte de Salidas</h2>
          <p className="text-sm text-gray-500 mt-1">Métricas de despacho, operadores y flota</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Desde</label>
            <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Hasta</label>
            <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500" />
          </div>
          <button
            onClick={handleExport}
            disabled={exportando}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl active:scale-[0.97] disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exportando ? 'Exportando...' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          value={stats.totalAsignados}
          label="Misiones asignadas"
          sub={`${stats.enTransito} en curso`}
          color="from-violet-500 to-purple-600"
        />
        <StatCard
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          value={stats.totalEntregados}
          label="Entregas completadas"
          badge={`${stats.tasaExito}%`}
          sub={`${stats.entregadosHoy} hoy`}
          color="from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          value={stats.tiempoPromedio !== null ? `${stats.tiempoPromedio}min` : '—'}
          label="Tiempo promedio"
          sub={stats.tiempoMin !== null ? `${stats.tiempoMin}min - ${stats.tiempoMax}min` : ''}
          color="from-sky-500 to-cyan-600"
        />
        <StatCard
          icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          value={`${stats.dronUtilizacion}%`}
          label="Utilización de flota"
          sub={`${drones.length} drones registrados`}
          color="from-amber-500 to-orange-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_24px_rgb(0,0,0,0.04)]">
              <h3 className="text-sm font-bold text-gray-900 mb-5 font-['Plus_Jakarta_Sans']">Top Operadores</h3>
              <div className="space-y-3">
                {stats.topOperadores.length > 0 ? stats.topOperadores.map(([nombre, count], i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                      {i + 1}
                    </div>
                    <MiniBar label={nombre} value={count} max={stats.topOperadores[0]?.[1] || 1} color="bg-gradient-to-r from-indigo-400 to-violet-500" />
                  </div>
                )) : <p className="text-sm text-gray-400 text-center py-6">Sin datos</p>}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_24px_rgb(0,0,0,0.04)]">
              <h3 className="text-sm font-bold text-gray-900 mb-5 font-['Plus_Jakarta_Sans']">Top Drones</h3>
              <div className="space-y-3">
                {stats.topDrones.length > 0 ? stats.topDrones.map(([modelo, count], i) => (
                  <MiniBar key={i} label={modelo} value={count} max={stats.topDrones[0]?.[1] || 1} color="bg-gradient-to-r from-amber-400 to-orange-500" />
                )) : <p className="text-sm text-gray-400 text-center py-6">Sin datos</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_24px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Estado de las misiones</h3>
              <div className="flex items-center gap-3 flex-wrap">
                {donutSegments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                    <span className="text-[10px] text-gray-500 font-medium">{seg.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
              <Donut segments={donutSegments} size={160} strokeWidth={22} />
              <div className="space-y-3">
                {donutSegments.map((seg, i) => {
                  const total = donutSegments.reduce((s, ss) => s + ss.value, 0)
                  const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: seg.color }} />
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{seg.label}</div>
                        <div className="text-xs text-gray-400">{seg.value} ({pct}%)</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest opacity-80">Hoy</h3>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.entregadosHoy}</div>
            <div className="text-sm opacity-80">entregas realizadas</div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="opacity-70">En tránsito</span>
              <span className="font-bold">{stats.enTransito}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="opacity-70">Tasa de éxito</span>
              <span className="font-bold">{stats.tasaExito}%</span>
            </div>
          </div>

          {totalEntregadosConTiempo > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_24px_rgb(0,0,0,0.04)]">
              <h3 className="text-sm font-bold text-gray-900 mb-5 font-['Plus_Jakarta_Sans']">Distribución de tiempos</h3>
              <div className="space-y-3">
                {rangoLabels.map((label, i) => (
                  <MiniBar key={i} label={label} value={stats.tiemposRangos[i]} max={Math.max(...stats.tiemposRangos, 1)} color={`bg-gradient-to-r ${rangoColors[i]}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
