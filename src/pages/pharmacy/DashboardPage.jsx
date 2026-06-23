import { useState, useMemo, useEffect } from 'react'
import { getPedidos, getFarmacia } from '../../api'

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PharmacyDashboardPage({ user }) {
  const [pedidos, setPedidos] = useState([])
  const [profile, setProfile] = useState(null)

  const farmaciaId = user?.id_farmacia

  useEffect(() => {
    if (!farmaciaId) return
    getPedidos({ id_farmacia: farmaciaId }).then(data => {
      if (Array.isArray(data)) setPedidos(data)
      else if (data?.pedidos) setPedidos(data.pedidos)
    }).catch(() => {})
    getFarmacia(farmaciaId).then(setProfile).catch(() => {})
  }, [farmaciaId])

  const totalIngresos = pedidos.reduce((sum, o) => sum + Number(o.total), 0)
  const preparando = pedidos.filter(o => o.estado_pedido === 'Preparando').length
  const preparados = pedidos.filter(o => o.estado_pedido === 'Preparado').length
  const enTransito = pedidos.filter(o => o.estado_pedido === 'En transito').length
  const entregado = pedidos.filter(o => o.estado_pedido === 'Entregado').length
  const activas = preparando + preparados + enTransito

  const recentOrders = [...pedidos]
    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Total Pedidos</div>
          <div className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">{pedidos.length}</div>
          <div className="mt-2 text-xs text-gray-400">
            {entregado} entregados, {activas} activos
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Ingresos Totales</div>
          <div className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">{formatCurrency(totalIngresos)}</div>
          <div className="mt-2 text-xs text-gray-400">
            {pedidos.length > 0
              ? 'Promedio: ' + formatCurrency(Math.round(totalIngresos / pedidos.length)) + ' por pedido'
              : 'Sin datos'}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Pedidos Activos</div>
          <div className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">{activas}</div>
          <div className="mt-2 text-xs text-gray-400">
            {preparando > 0 ? preparando + ' preparando' : ''}
            {preparando > 0 && preparados > 0 ? ' - ' : ''}
            {preparados > 0 ? preparados + ' preparados' : ''}
            {((preparando > 0 || preparados > 0) && enTransito > 0) ? ' - ' : ''}
            {enTransito > 0 ? enTransito + ' en transito' : ''}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Pedidos Entregados</div>
          <div className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">{entregado}</div>
          <div className="mt-2 text-xs text-gray-400">
            {entregado > 0
              ? Math.round((entregado / pedidos.length) * 100) + '% del total'
              : 'Sin entregas'}
          </div>
        </div>
      </div>

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[1.5fr_1fr]">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 font-['Plus_Jakarta_Sans']">Pedidos Recientes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                  <th className="text-left pb-3 pr-4">Orden</th>
                  <th className="text-left pb-3 pr-4">Total</th>
                  <th className="text-left pb-3 pr-4">Estado</th>
                  <th className="text-left pb-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id_pedido} className="border-b border-gray-50">
                    <td className="py-3 pr-4 text-gray-800 font-semibold whitespace-nowrap">#{o.id_pedido}</td>
                    <td className="py-3 pr-4 text-gray-800 whitespace-nowrap">{formatCurrency(o.total)}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        o.estado_pedido === 'Entregado' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                        o.estado_pedido === 'En transito' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        o.estado_pedido === 'Preparado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {o.estado_pedido}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-xs whitespace-nowrap">{o.fecha_creacion ? new Date(o.fecha_creacion).toLocaleDateString('es-ES') : ''}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-400 text-sm">Sin pedidos</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 font-['Plus_Jakarta_Sans']">Farmacia</h3>
          {profile ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-lg shadow-blue-500/10 mb-3 overflow-hidden">
                  {profile.logo_url ? (
                    <img src={profile.logo_url} alt={profile.nombre_comercial} className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-4xl font-bold bg-gradient-to-br from-sky-500 to-blue-600 bg-clip-text text-transparent">{profile.nombre_comercial?.charAt(0) || 'F'}</span>
                  )}
                </div>
                <div className="text-lg font-bold text-gray-800">{profile.nombre_comercial}</div>
                <div className="text-xs text-gray-500">{profile.ciudad}</div>
              </div>

              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Informacion</div>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Direccion</span><span className="text-gray-800 text-right max-w-[180px]">{profile.direccion}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Telefono</span><span className="text-gray-800">{profile.telefono}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-800 text-right max-w-[180px] break-all">{profile.email}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Ciudad</span><span className="text-gray-800">{profile.ciudad}</span></div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Resumen de pedidos</div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Preparando</span><span className="font-semibold text-gray-800">{preparando}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Preparado</span><span className="font-semibold text-gray-800">{preparados}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">En transito</span><span className="font-semibold text-gray-800">{enTransito}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Entregado</span><span className="font-semibold text-gray-800">{entregado}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Perfil no disponible</div>
          )}
        </div>
      </div>
    </div>
  )
}
