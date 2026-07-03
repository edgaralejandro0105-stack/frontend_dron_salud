import { useState, useMemo, useEffect } from 'react'
import { getPedidos, getDrones, getFarmacias } from '../../api'
import AreaChartSVG from '../../components/charts/AreaChart'

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
  const [filtroFarmacia, setFiltroFarmacia] = useState('')
  const [farmacias, setFarmacias] = useState([])
  const [exportando, setExportando] = useState(false)
  const [revenueView, setRevenueView] = useState('dia')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    let cancelled = false
    setCargando(true)
    const params = {}
    if (filtroDesde) params.desde = filtroDesde
    if (filtroHasta) params.hasta = filtroHasta
    if (filtroFarmacia) params.id_farmacia = filtroFarmacia

    getPedidos(params)
      .then(p => {
        if (!cancelled) {
          if (Array.isArray(p)) setPedidos(p)
          else if (p?.pedidos) setPedidos(p.pedidos)
        }
      })
      .catch(err => {
        if (!cancelled) console.error('Error al cargar datos del reporte:', err)
      })
      .finally(() => {
        if (!cancelled) setCargando(false)
      })

    getDrones()
      .then(d => {
        if (!cancelled) {
          if (Array.isArray(d)) setDrones(d)
          else if (d?.drones) setDrones(d.drones)
        }
      })
      .catch(err => {
        if (!cancelled) console.error('Error al cargar drones:', err)
      })

    return () => { cancelled = true }
  }, [filtroDesde, filtroHasta, filtroFarmacia])

  useEffect(() => {
    getDrones()
      .then(d => {
        if (Array.isArray(d)) setDrones(d)
        else if (d?.drones) setDrones(d.drones)
      })
      .catch((err) => {
        console.error('Error al cargar drones:', err)
      })
  }, [])

  useEffect(() => {
    getFarmacias()
      .then(f => {
        if (Array.isArray(f)) setFarmacias(f)
        else if (f?.farmacias) setFarmacias(f.farmacias)
      })
      .catch(err => {
        console.error('Error al cargar farmacias:', err)
      })
  }, [])

  const filtered = useMemo(() => {
    return [...pedidos]
  }, [pedidos])

  const entregadosConTiempo = useMemo(() => {
    return filtered.filter(o => o.estado_pedido === 'Entregado' && o.timestamp_inicio && o.timestamp_fin)
  }, [filtered])

  const totalEntregadosConTiempo = entregadosConTiempo.length

  const stats = useMemo(() => {
    const entregados = filtered.filter(o => o.estado_pedido === 'Entregado')
    const enTransito = filtered.filter(o => o.estado_pedido === 'En transito')
    const asignados = filtered.filter(o => o.id_dron)
    const tieneFiltro = !!(filtroDesde || filtroHasta)

    let tiempoPromedio = null, tiempoMin = null, tiempoMax = null
    if (entregadosConTiempo.length > 0) {
      const tiempos = entregadosConTiempo.map(o => (new Date(o.timestamp_fin) - new Date(o.timestamp_inicio)) / 60000)
      tiempoPromedio = Math.round(tiempos.reduce((s, t) => s + t, 0) / tiempos.length)
      tiempoMin = Math.round(Math.min(...tiempos))
      tiempoMax = Math.round(Math.max(...tiempos))
    }

    const dronCounts = {}
    for (const o of asignados) {
      const modelo = o.dron?.modelo || `#${o.id_dron}`
      dronCounts[modelo] = (dronCounts[modelo] || 0) + 1
    }
    const topDrones = Object.entries(dronCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

    const pedidosPorEstado = {}
    for (const o of filtered) pedidosPorEstado[o.estado_pedido] = (pedidosPorEstado[o.estado_pedido] || 0) + 1

    const ahora = new Date()
    const allEntregados = filtered.filter(o => o.estado_pedido === 'Entregado')

    let entregasHoy, entregadosHoyLabel, ingresosDiario, ingresosSemanal, ingresosMensual
    let labelIngreso1, labelIngreso2, labelIngreso3
    let revenueDaily = [], revenueWeekly = [], revenueMonthly = []

    if (tieneFiltro) {
      const desdeDate = filtroDesde ? new Date(filtroDesde + 'T00:00:00') : null
      const hastaDate = filtroHasta ? new Date(filtroHasta + 'T23:59:59') : null

      entregasHoy = entregados.length
      entregadosHoyLabel = 'En el rango'

      ingresosDiario = allEntregados.reduce((s, o) => s + Number(o.cargo_dron || 0), 0)
      ingresosSemanal = allEntregados.length > 0
        ? Math.round((ingresosDiario / allEntregados.length) * 100) / 100
        : 0
      ingresosMensual = allEntregados.length

      labelIngreso1 = filtroDesde && filtroHasta
        ? `${new Date(filtroDesde + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${new Date(filtroHasta + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
        : 'Rango'
      labelIngreso2 = 'Prom. x entrega'
      labelIngreso3 = 'Total entregas'

      const dInicio = desdeDate ? new Date(desdeDate) : (hastaDate ? new Date(hastaDate.getTime() - 6 * 86400000) : new Date(ahora))
      dInicio.setHours(0, 0, 0, 0)
      const dFin = hastaDate ? new Date(hastaDate) : (desdeDate ? new Date(desdeDate.getTime() + 6 * 86400000) : new Date())
      dFin.setHours(0, 0, 0, 0)

      const dailyTotals = {}
      allEntregados.forEach(o => {
        const dia = o.fecha_creacion ? o.fecha_creacion.substring(0, 10) : ''
        if (dia) dailyTotals[dia] = (dailyTotals[dia] || 0) + Number(o.cargo_dron || 0)
      })

      let current = new Date(dInicio)
      while (current <= dFin && revenueDaily.length < 31) {
        const diaStr = current.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        const iso = current.toISOString().substring(0, 10)
        revenueDaily.push({ label: diaStr, value: dailyTotals[iso] || 0 })
        current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1)
      }
    } else {
      const inicioDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
      const inicioSemana = new Date(ahora)
      inicioSemana.setDate(ahora.getDate() - ahora.getDay())
      inicioSemana.setHours(0, 0, 0, 0)
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

      entregasHoy = entregados.filter(o => new Date(o.fecha_creacion).toDateString() === new Date().toDateString()).length
      entregadosHoyLabel = 'hoy'

      ingresosDiario = allEntregados.filter(o => new Date(o.fecha_creacion) >= inicioDia).reduce((s, o) => s + Number(o.cargo_dron || 0), 0)
      ingresosSemanal = allEntregados.filter(o => new Date(o.fecha_creacion) >= inicioSemana).reduce((s, o) => s + Number(o.cargo_dron || 0), 0)
      ingresosMensual = allEntregados.filter(o => new Date(o.fecha_creacion) >= inicioMes).reduce((s, o) => s + Number(o.cargo_dron || 0), 0)
      labelIngreso1 = 'Hoy'
      labelIngreso2 = 'Esta semana'
      labelIngreso3 = 'Este mes'

      for (let i = 6; i >= 0; i--) {
        const d = new Date(ahora)
        d.setDate(ahora.getDate() - i)
        const diaStr = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
        const fechaInicio = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        const fechaFin = new Date(fechaInicio)
        fechaFin.setDate(fechaFin.getDate() + 1)
        const total = allEntregados.filter(o => {
          const fc = new Date(o.fecha_creacion)
          return fc >= fechaInicio && fc < fechaFin
        }).reduce((s, o) => s + Number(o.cargo_dron || 0), 0)
        revenueDaily.push({ label: diaStr, value: total })
      }

      for (let i = 3; i >= 0; i--) {
        const d = new Date(ahora)
        d.setDate(ahora.getDate() - (i * 7))
        const inicioSem = new Date(d)
        inicioSem.setDate(d.getDate() - d.getDay())
        inicioSem.setHours(0, 0, 0, 0)
        const finSem = new Date(inicioSem)
        finSem.setDate(finSem.getDate() + 7)
        const label = `${inicioSem.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
        const total = allEntregados.filter(o => {
          const fc = new Date(o.fecha_creacion)
          return fc >= inicioSem && fc < finSem
        }).reduce((s, o) => s + Number(o.cargo_dron || 0), 0)
        revenueWeekly.push({ label, value: total })
      }

      for (let i = 5; i >= 0; i--) {
        const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
        const inicioM = new Date(d)
        const finM = new Date(d.getFullYear(), d.getMonth() + 1, 1)
        const label = inicioM.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
        const total = allEntregados.filter(o => {
          const fc = new Date(o.fecha_creacion)
          return fc >= inicioM && fc < finM
        }).reduce((s, o) => s + Number(o.cargo_dron || 0), 0)
        revenueMonthly.push({ label, value: total })
      }
    }

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
      entregadosHoyLabel,
      enTransito: enTransito.length,
      tasaExito: filtered.length > 0 ? Math.round((entregados.length / filtered.length) * 100) : 0,
      tiempoPromedio, tiempoMin, tiempoMax,
      topDrones,
      pedidosPorEstado, dronUtilizacion,
      tiemposRangos, ingresosDiario, ingresosSemanal, ingresosMensual,
      labelIngreso1, labelIngreso2, labelIngreso3,
      tieneFiltro,
      revenueDaily, revenueWeekly, revenueMonthly
    }
  }, [filtered, drones, entregadosConTiempo, filtroDesde, filtroHasta])

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
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Farmacia</label>
            <select
              value={filtroFarmacia}
              onChange={e => setFiltroFarmacia(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              <option value="">Todas</option>
              {farmacias.map(f => (
                <option key={f.id_farmacia} value={f.id_farmacia}>{f.nombre_comercial}</option>
              ))}
            </select>
          </div>
          {(filtroDesde || filtroHasta || filtroFarmacia) && (
            <button
              onClick={() => { setFiltroDesde(''); setFiltroHasta(''); setFiltroFarmacia('') }}
              className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          )}
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

      {cargando && (
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 animate-pulse rounded-full" style={{ width: '100%' }} />
        </div>
      )}

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
          sub={`${stats.entregadosHoy} ${stats.entregadosHoyLabel}`}
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
          color="from-sky-500 to-blue-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_24px_rgb(0,0,0,0.04)]">
              <h3 className="text-sm font-bold text-gray-900 mb-5 font-['Plus_Jakarta_Sans']">Top Drones</h3>
              <div className="space-y-3">
                {stats.topDrones.length > 0 ? stats.topDrones.map(([modelo, count], i) => (
                  <MiniBar key={i} label={modelo} value={count} max={stats.topDrones[0]?.[1] || 1} color="bg-gradient-to-r from-sky-400 to-blue-500" />
                )) : <p className="text-sm text-gray-400 text-center py-6">Sin datos</p>}
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
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_24px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Ingresos por Envíos</h3>
              {!stats.tieneFiltro && (
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                  {['dia', 'semana', 'mes'].map(v => (
                    <button key={v} onClick={() => setRevenueView(v)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${revenueView === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {v === 'dia' ? 'Día' : v === 'semana' ? 'Semana' : 'Mes'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="h-[200px]">
              <AreaChartSVG
                data={revenueView === 'dia' ? stats.revenueDaily : revenueView === 'semana' ? stats.revenueWeekly : stats.revenueMonthly}
                dataKey="value"
                color="#059669"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{stats.labelIngreso1}</div>
                <div className="text-sm font-bold text-emerald-600">{formatCurrency(stats.ingresosDiario)}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{stats.labelIngreso2}</div>
                <div className="text-sm font-bold text-emerald-600">{formatCurrency(stats.ingresosSemanal)}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{stats.labelIngreso3}</div>
                <div className="text-sm font-bold text-emerald-600">{stats.tieneFiltro ? stats.ingresosMensual : formatCurrency(stats.ingresosMensual)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_24px_rgb(0,0,0,0.04)]">
            <h3 className="text-sm font-bold text-gray-900 mb-5 font-['Plus_Jakarta_Sans']">Resumen de Entregas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Entregas {stats.entregadosHoyLabel}</span>
                <span className="text-sm font-bold text-emerald-600">{stats.entregadosHoy}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">En tránsito</span>
                <span className="text-sm font-bold text-blue-600">{stats.enTransito}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Tasa de éxito</span>
                <span className="text-sm font-bold text-violet-600">{stats.tasaExito}%</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Utilización flota</span>
                <span className="text-sm font-bold text-sky-600">{stats.dronUtilizacion}%</span>
              </div>
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
