import { useState, useMemo, useEffect } from 'react'
import { getOwnStats } from '../../api'
import AreaChartSVG from '../../components/charts/AreaChart'

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function StatCard({ icon, value, label, sub, color }) {
  return (
    <div className="relative bg-white rounded-3xl border border-gray-100 p-5 shadow-[0_4px_24px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgb(0,0,0,0.08)] transition-all duration-300">
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

export default function PharmacyReportsPage({ user }) {
  const [stats, setStats] = useState(null)
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    let cancelled = false
    setCargando(true)
    const params = {}
    if (filtroDesde) params.desde = filtroDesde
    if (filtroHasta) params.hasta = filtroHasta

    getOwnStats(params)
      .then(data => {
        if (!cancelled) setStats(data)
      })
      .catch(err => {
        if (!cancelled) console.error('Error al cargar estadísticas:', err)
      })
      .finally(() => {
        if (!cancelled) setCargando(false)
      })

    return () => { cancelled = true }
  }, [filtroDesde, filtroHasta])

  const chartData = useMemo(() => {
    if (!stats?.dailyRevenue) return []
    const entries = Object.entries(stats.dailyRevenue).sort(([a], [b]) => a.localeCompare(b))
    return entries.map(([dia, value]) => {
      const d = new Date(dia + 'T12:00:00')
      const label = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      return { label, value }
    })
  }, [stats])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Reportes</h2>
          <p className="text-sm text-gray-500 mt-1">Ingresos, productos más vendidos y métricas</p>
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
          {(filtroDesde || filtroHasta) && (
            <button
              onClick={() => { setFiltroDesde(''); setFiltroHasta('') }}
              className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          )}
        </div>
      </div>

      {cargando && (
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 animate-pulse rounded-full" style={{ width: '100%' }} />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          value={formatCurrency(stats?.ingresosEnvio || 0)}
          label="Ingresos por envíos"
          sub="Cargo dron"
          color="from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          value={formatCurrency(stats?.ingresosMedicamentos || 0)}
          label="Ingresos medicamentos"
          sub="Subtotal + IVA"
          color="from-cyan-500 to-blue-600"
        />
        <StatCard
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          value={stats?.totalPedidos || 0}
          label="Pedidos totales"
          color="from-sky-500 to-cyan-600"
        />
        <StatCard
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          value={stats?.totalEntregados || 0}
          label="Entregados"
          color="from-violet-500 to-purple-600"
        />
        <StatCard
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          value={stats?.totalPedidos > 0 ? `${Math.round((stats.totalEntregados / stats.totalPedidos) * 100)}%` : '—'}
          label="Tasa de éxito"
          color="from-sky-500 to-blue-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_24px_rgb(0,0,0,0.04)]">
          <h3 className="text-sm font-bold text-gray-900 mb-4 font-['Plus_Jakarta_Sans']">Ingresos diarios (envíos)</h3>
          {chartData.length > 0 ? (
            <div className="h-[220px]">
              <AreaChartSVG data={chartData} dataKey="value" color="#059669" />
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              {stats ? 'Sin datos de ingresos en este período' : 'Cargando...'}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_24px_rgb(0,0,0,0.04)]">
          <h3 className="text-sm font-bold text-gray-900 mb-5 font-['Plus_Jakarta_Sans']">Productos más vendidos</h3>
          {stats?.topProductos?.length > 0 ? (
            <div className="space-y-3">
              {stats.topProductos.map((prod, i) => {
                const max = stats.topProductos[0]?.cantidad || 1
                const pct = max > 0 ? (prod.cantidad / max) * 100 : 0
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {prod.foto_url ? (
                        <img src={prod.foto_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{prod.nombre}</div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000" style={{ width: `${Math.max(pct, 2)}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-800 w-10 text-right flex-shrink-0">{prod.cantidad}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              {stats ? 'Sin productos vendidos en este período' : 'Cargando...'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
