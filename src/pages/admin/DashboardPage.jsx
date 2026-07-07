import { useMemo, useEffect, useState } from 'react'
import { getPedidos, getDrones, getFarmacias, getUsuarios } from '../../api'
import AreaChartSVG from '../../components/charts/AreaChart'
import BarChartSVG from '../../components/charts/BarChart'
import DonutChart from '../../components/charts/DonutChart'
import Sparkline from '../../components/charts/Sparkline'

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const kpiCards = [
  {
    key: 'ingresos', label: 'Ingresos Totales',
    gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20',
    icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    format: (v) => formatCurrency(v),
  },
  {
    key: 'pedidos', label: 'Pedidos Totales',
    gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20',
    icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>),
    format: (v) => v.toLocaleString(),
  },
  {
    key: 'entregados', label: 'Entregados',
    gradient: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20',
    icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    format: (v) => v.toLocaleString(),
  },
  {
    key: 'drones', label: 'Drones',
    gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/20',
    icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>),
    format: (v, a) => `${a.disponibles} disp. · ${a.operativos} op.`,
    badge: (v, a) => `${a.totales} totales`,
  },
  {
    key: 'farmacias', label: 'Farmacias',
    gradient: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-500/20',
    icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>),
    format: (v) => v.toLocaleString(),
  },
  {
    key: 'clientes', label: 'Clientes',
    gradient: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-500/20',
    icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
    format: (v) => v.toLocaleString(),
  },
]

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState([])
  const [drones, setDrones] = useState([])
  const [farmacias, setFarmacias] = useState([])
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    Promise.all([getPedidos({ limit: 10000 }), getDrones({ limit: 1000 }), getFarmacias({ limit: 1000 }), getUsuarios({ limit: 1000 })])
      .then(([p, d, f, u]) => {
        if (Array.isArray(p)) setPedidos(p)
        else if (p?.pedidos) setPedidos(p.pedidos)
        else if (p?.data) setPedidos(p.data)
        if (Array.isArray(d)) setDrones(d)
        else if (d?.drones) setDrones(d.drones)
        else if (d?.data) setDrones(d.data)
        if (Array.isArray(f)) setFarmacias(f)
        else if (f?.farmacias) setFarmacias(f.farmacias)
        else if (f?.data) setFarmacias(f.data)
        if (Array.isArray(u)) setUsuarios(u)
        else if (u?.usuarios) setUsuarios(u.usuarios)
        else if (u?.data) setUsuarios(u.data)
      })
      .catch(() => {})
  }, [])

  const stats = useMemo(() => {
    const total = pedidos.length
    const entregados = pedidos.filter(o => o.estado_pedido === 'Entregado').length
    const enTransito = pedidos.filter(o => o.estado_pedido === 'En transito').length
    const pendientes = pedidos.filter(o => o.estado_pedido === 'Pendiente' || o.estado_pedido === 'Pagado').length
    const ingresos = pedidos.reduce((sum, o) => sum + Number(o.cargo_dron || 0), 0)
    const disponibles = drones.filter(d => d.estado_operativo === 'Activo').length
    const operativos = drones.filter(d => d.estado_operativo !== 'Mantenimiento' && d.estado_operativo !== 'Cancelado').length
    const clientesUnicos = usuarios.filter(u => u.tipo_usuario === 'cliente').length
    return { total, entregados, enTransito, pendientes, ingresos, disponibles, operativos, clientesUnicos }
  }, [pedidos, drones, usuarios])

  const kpiValues = useMemo(() => ({
    ingresos: stats.ingresos,
    pedidos: stats.total,
    entregados: stats.entregados,
    drones: { disponibles: stats.disponibles, operativos: stats.operativos, totales: drones.length, capacidad: drones.length > 0 ? Math.round((stats.operativos / drones.length) * 100) : 0 },
    farmacias: farmacias.length,
    clientes: stats.clientesUnicos,
  }), [stats, drones, farmacias])

  const ordenesPorEstado = useMemo(() => [
    { estado: 'Entregado', valor: stats.entregados, color: '#059669' },
    { estado: 'En tránsito', valor: stats.enTransito, color: '#3B82F6' },
    { estado: 'Pendiente', valor: stats.pendientes, color: '#8B5CF6' },
  ], [stats])

  const donutData = useMemo(() => ordenesPorEstado.filter(d => d.valor > 0), [ordenesPorEstado])

  const recentOrders = useMemo(() => {
    return [...pedidos].sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
  }, [pedidos])

  const barData = useMemo(() => {
    return farmacias
      .map(f => {
        const count = pedidos.filter(p => p.id_farmacia === f.id_farmacia).length
        return { nombre: f.nombre_comercial, pedidos: count }
      })
      .sort((a, b) => b.pedidos - a.pedidos)
      .slice(0, 5)
  }, [farmacias, pedidos])

  const monthlyData = useMemo(() => {
    const months = {}
    pedidos.forEach(p => {
      if (!p.fecha_creacion) return
      const d = new Date(p.fecha_creacion)
      const key = d.toLocaleString('es-ES', { month: 'short', year: '2-digit' })
      months[key] = (months[key] || 0) + 1
    })
    return Object.entries(months).slice(-6).map(([mes, envios]) => ({ name: mes, envios }))
  }, [pedidos])

  const weeklyRevenue = pedidos
    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
    .slice(0, 7)
    .map(o => ({ ingresos: Number(o.total || 0) }))
  const weeklyValues = weeklyRevenue.map(w => w.ingresos)

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
            <div key={card.key} className="relative group animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className="relative bg-white rounded-2xl border border-gray-100 p-5 card-hover overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 bg-gradient-to-br ${card.gradient} opacity-[0.04] rounded-full`} />
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} ${card.shadow} flex items-center justify-center text-white shadow-lg`}>
                    {card.icon}
                  </div>
                </div>
                {card.key === 'drones' ? (
                  <>
                    <div className="flex items-baseline gap-4">
                      <div>
                        <div className="text-[10px] text-gray-400 mb-0.5">Disponibles</div>
                        <div className="text-xl text-gray-900 tracking-tight">{value.disponibles}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 mb-0.5">Operativos</div>
                        <div className="text-xl text-gray-900 tracking-tight">{value.operativos}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-[10px] text-gray-300">{value.totales} registrados</div>
                      <span className="text-[10px] text-sky-600">{value.capacidad}% op.</span>
                    </div>
                    <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full" style={{ width: `${value.capacidad}%` }} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{card.label}</div>
                    <div className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] tracking-tight">{displayValue}</div>
                    <div className="mt-2 flex items-center gap-2">
                      {card.key === 'ingresos' && weeklyValues.length > 0 && <Sparkline data={weeklyValues} color="#059669" />}
                      <span className="text-[11px] font-medium text-gray-400">{badgeText}</span>
                    </div>
                  </>
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
            <span className="text-[11px] text-gray-400 font-medium">Últimos meses</span>
          </div>
          <div className="h-[260px]">
            {monthlyData.length > 0 ? <AreaChartSVG data={monthlyData} dataKey="envios" /> : <p className="text-gray-400 text-sm text-center pt-20">Sin datos</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 card-hover">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Estado de Pedidos</h3>
            <span className="text-[11px] text-gray-400 font-medium">{stats.total} total</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-[140px] h-[140px] flex-shrink-0">
              <DonutChart data={donutData} size={160} innerRadius={0.55} />
            </div>
            <div className="flex-1 space-y-2.5">
              {ordenesPorEstado.map(d => (
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
            {barData.length > 0 ? <BarChartSVG data={barData} dataKey="pedidos" labelKey="nombre" /> : <p className="text-gray-400 text-sm text-center pt-20">Sin datos</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 card-hover">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Pedidos Recientes</h3>
            <span className="text-[11px] text-gray-400 font-medium">Últimos 4</span>
          </div>
          <div className="space-y-2.5">
            {recentOrders.slice(0, 4).map((order) => {
              const farmacia = order.farmacia
              return (
                <div key={order.id_pedido} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold ${
                      order.estado_pedido === 'Entregado' ? 'bg-emerald-500' :
                      order.estado_pedido === 'En transito' ? 'bg-blue-500' :
                      order.estado_pedido === 'Preparado' ? 'bg-amber-500' : 'bg-violet-500'
                    }`}>
                      {farmacia?.nombre_comercial?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">#{order.id_pedido}</div>
                      <div className="text-[10px] text-gray-400">{farmacia?.nombre_comercial || `Farmacia #${order.id_farmacia}`} · {order.fecha_creacion ? new Date(order.fecha_creacion).toLocaleDateString('es-ES') : ''}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                    order.estado_pedido === 'Entregado' ? 'bg-emerald-50 text-emerald-700' :
                    order.estado_pedido === 'En transito' ? 'bg-blue-50 text-blue-700' :
                    order.estado_pedido === 'Preparado' ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700'
                  }`}>
                    {order.estado_pedido}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
