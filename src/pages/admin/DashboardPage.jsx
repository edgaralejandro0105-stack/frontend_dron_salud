import { useMemo } from 'react'
import { ordersData, monthlyData, pharmaciesData, weeklyRevenue, ordenesPorEstado, fleetData } from '../../data/adminData'
import AreaChartSVG from '../../components/charts/AreaChart'
import BarChartSVG from '../../components/charts/BarChart'
import DonutChart from '../../components/charts/DonutChart'
import Sparkline from '../../components/charts/Sparkline'

const kpiCards = [
  {
    key: 'ingresos',
    label: 'Ingresos Totales',
    gradient: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    format: (v) => '$' + (v / 1000).toFixed(0) + 'K',
    badge: 'vs mes anterior',
  },
  {
    key: 'pedidos',
    label: 'Pedidos Totales',
    gradient: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    format: (v) => v.toLocaleString(),
    badge: 'último mes',
  },
  {
    key: 'entregados',
    label: 'Entregados',
    gradient: 'from-violet-500 to-violet-600',
    shadow: 'shadow-violet-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    format: (v) => v.toLocaleString(),
    badge: 'tasa de éxito',
  },
  {
    key: 'drones',
    label: 'Drones Activos',
    gradient: 'from-amber-500 to-amber-600',
    shadow: 'shadow-amber-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    format: (v, a) => `${a.activos} / ${a.totales}`,
    badge: (v, a) => `${a.capacidad}% capacidad`,
  },
  {
    key: 'tiempoEntrega',
    label: 'Tiempo Promedio',
    gradient: 'from-rose-500 to-rose-600',
    shadow: 'shadow-rose-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    format: (v) => `${v} min`,
    badge: (v) => `${Math.abs(v)}% más rápido`,
  },
  {
    key: 'satisfaccion',
    label: 'Satisfacción',
    gradient: 'from-cyan-500 to-cyan-600',
    shadow: 'shadow-cyan-500/20',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
      </svg>
    ),
    format: (v) => `${v.valor.toFixed(1)} / 5.0`,
    badge: (v, a) => `+${a.tendencia}`,
  },
]

export default function DashboardPage() {
  const stats = useMemo(() => {
    const total = ordersData.length
    const entregados = ordersData.filter((o) => o.estado === 'Entregado').length
    const enTransito = ordersData.filter((o) => o.estado === 'En tránsito').length
    const preparando = ordersData.filter((o) => o.estado === 'Preparando' || o.estado === 'Preparado').length
    const ingresos = ordersData.reduce((sum, o) => sum + o.total, 0)
    const enVuelo = fleetData.filter((d) => d.estado === 'En vuelo').length
    const disponibles = fleetData.filter((d) => d.estado === 'Disponible').length
    return { total, entregados, enTransito, preparando, ingresos, enVuelo, disponibles }
  }, [])

  const kpiValues = useMemo(() => ({
    ingresos: stats.ingresos * 15,
    pedidos: stats.total * 18 + 1190,
    entregados: stats.entregados * 9 + 854,
    drones: { activos: stats.enVuelo + 2, totales: fleetData.length, capacidad: 84 },
    tiempoEntrega: 24,
    satisfaccion: { valor: 4.8, tendencia: 0.3 },
  }), [stats])

  const weeklyValues = weeklyRevenue.map((w) => w.ingresos)

  const recentOrders = useMemo(() => {
    return [...ordersData].sort((a, b) => {
      const [da, ta] = a.fecha.split(' ')
      const [db, tb] = b.fecha.split(' ')
      const dateA = new Date(da.split('/').reverse().join('-') + 'T' + tb)
      const dateB = new Date(db.split('/').reverse().join('-') + 'T' + tb)
      return dateB - dateA
    })
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-sm text-gray-500">Resumen ejecutivo · {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {kpiCards.map((card, idx) => {
          const rawValue = kpiValues[card.key]
          const value = typeof rawValue === 'object' ? rawValue : rawValue
          const displayValue = typeof card.format === 'function' ? card.format(rawValue, value) : rawValue
          const badgeText = typeof card.badge === 'function' ? card.badge(rawValue, value) : card.badge

          return (
            <div
              key={card.key}
              className="relative group animate-fade-in-up"
              style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className="relative bg-white rounded-2xl border border-gray-100 p-5 card-hover overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 bg-gradient-to-br ${card.gradient} opacity-[0.04] rounded-full`} />
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} ${card.shadow} flex items-center justify-center text-white shadow-lg`}>
                    {card.icon}
                  </div>
                  {card.key !== 'drones' && card.key !== 'satisfaccion' && card.key !== 'tiempoEntrega' && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      {card.key === 'ingresos' ? '12.5%' : card.key === 'pedidos' ? '8.3%' : '15.2%'}
                    </span>
                  )}
                  {card.key === 'tiempoEntrega' && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      5.2%
                    </span>
                  )}
                  {card.key === 'satisfaccion' && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      0.3
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{card.label}</div>
                <div className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] tracking-tight">{displayValue}</div>
                <div className="mt-2 flex items-center gap-2">
                  {card.key === 'ingresos' && <Sparkline data={weeklyValues} color="#059669" />}
                  <span className={`text-[11px] font-medium ${card.key === 'drones' ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full' : 'text-gray-400'}`}>{badgeText}</span>
                </div>
                {card.key === 'drones' && (
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full animate-progress" style={{ width: '84%' }} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[1.4fr_1fr]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 card-hover">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Envíos por Mes</h3>
            <span className="text-[11px] text-gray-400 font-medium">Últimos 6 meses</span>
          </div>
          <div className="h-[260px]">
            <AreaChartSVG data={monthlyData} dataKey="envios" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 card-hover">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Estado de Pedidos</h3>
            <span className="text-[11px] text-gray-400 font-medium">{ordenesPorEstado.reduce((s, d) => s + d.valor, 0)} total</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-[140px] h-[140px] flex-shrink-0">
              <DonutChart data={ordenesPorEstado} size={160} innerRadius={0.55} />
            </div>
            <div className="flex-1 space-y-2.5">
              {ordenesPorEstado.map((d) => (
                <div key={d.estado} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs font-medium text-gray-600">{d.estado}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{d.valor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[1.4fr_1fr]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 card-hover">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Farmacias con más Pedidos</h3>
            <span className="text-[11px] text-gray-400 font-medium">Top 5</span>
          </div>
          <div className="h-[240px]">
            <BarChartSVG data={pharmaciesData} dataKey="pedidos" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 card-hover">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Pedidos Recientes</h3>
            <span className="text-[11px] text-gray-400 font-medium">Últimos 4</span>
          </div>
          <div className="space-y-2.5">
            {recentOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold ${
                    order.estado === 'Entregado' ? 'bg-emerald-500' :
                    order.estado === 'En tránsito' ? 'bg-blue-500' :
                    order.estado === 'Preparado' ? 'bg-amber-500' : 'bg-violet-500'
                  }`}>
                    {order.farmacia.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{order.id}</div>
                    <div className="text-[10px] text-gray-400">{order.farmacia} · {order.fecha}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                  order.estado === 'Entregado' ? 'bg-emerald-50 text-emerald-700' :
                  order.estado === 'En tránsito' ? 'bg-blue-50 text-blue-700' :
                  order.estado === 'Preparado' ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700'
                }`}>
                  {order.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
