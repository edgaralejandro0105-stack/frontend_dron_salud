import { useMemo } from 'react'
import { ordersData, monthlyData, pharmaciesData } from '../../data/adminData'
import AreaChartSVG from '../charts/AreaChart'
import BarChartSVG from '../charts/BarChart'

function formatCurrency(n) {
  return '$' + n.toLocaleString()
}

export default function DashboardModule() {
  const stats = useMemo(() => {
    const total = ordersData.length
    const entregados = ordersData.filter((o) => o.estado === 'Entregado').length
    const enTransito = ordersData.filter((o) => o.estado === 'En tránsito').length
    const preparando = ordersData.filter((o) => o.estado === 'Preparando' || o.estado === 'Preparado').length
    const ingresos = ordersData.reduce((sum, o) => sum + o.total, 0)
    return { total, entregados, enTransito, preparando, ingresos }
  }, [])

  return (
    <>
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mb-8">
        <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 flex flex-col justify-between min-h-[180px]">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Total de Ventas</div>
          <div className="text-4xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">{formatCurrency(stats.ingresos)}</div>
          <div className="mt-3"><span className="bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full px-3 py-1">{stats.total} pedidos generados</span></div>
        </div>
        <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 flex flex-col justify-between min-h-[180px]">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Drones Activos</div>
          <div className="text-4xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">42 / 50</div>
          <div className="mt-3"><span className="bg-sky-50 text-sky-700 text-xs font-semibold rounded-full px-3 py-1">84% Capacidad</span></div>
        </div>
        <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 flex flex-col justify-between min-h-[180px]">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Pedidos</div>
          <div className="text-4xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">{stats.total}</div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full px-3 py-1">{stats.enTransito} en transito</span>
            <span className="bg-amber-50 text-amber-700 text-xs font-semibold rounded-full px-3 py-1">{stats.preparando} activos</span>
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold rounded-full px-3 py-1">{stats.entregados} entregados</span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[1.5fr_1fr]">
        <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-5 font-['Plus_Jakarta_Sans']">Envios por Mes</h3>
          <div className="h-[280px]">
            <AreaChartSVG data={monthlyData} dataKey="envios" />
          </div>
        </div>
        <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-5 font-['Plus_Jakarta_Sans']">Farmacias con mas Pedidos</h3>
          <div className="h-[280px]">
            <BarChartSVG data={pharmaciesData} dataKey="pedidos" />
          </div>
        </div>
      </div>
    </>
  )
}
