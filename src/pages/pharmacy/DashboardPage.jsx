import { useState, useMemo, useEffect } from 'react'
import { getPedidos, getFarmacia, updateMyFarmacia } from '../../api'

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const statusPalette = {
  'Preparando': { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-400', border: 'border-sky-200' },
  'Preparado': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-200' },
  'En transito': { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400', border: 'border-indigo-200' },
  'Entregado': { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' },
}

export default function PharmacyDashboardPage({ user }) {
  const [pedidos, setPedidos] = useState([])
  const [profile, setProfile] = useState(null)
  const [toggling, setToggling] = useState(false)
  const farmaciaId = user?.id_farmacia

  async function toggleOpen() {
    if (!profile) return
    setToggling(true)
    try {
      const updated = await updateMyFarmacia({ estado_operativo: !profile.estado_operativo })
      setProfile(updated)
    } catch (err) {
      console.error('Error al cambiar estado:', err)
    }
    setToggling(false)
  }

  useEffect(() => {
    if (!farmaciaId) return
    getPedidos({ id_farmacia: farmaciaId, limit: 1000 }).then(data => {
      if (Array.isArray(data)) setPedidos(data)
      else if (data?.pedidos) setPedidos(data.pedidos)
      else if (data?.data) setPedidos(data.data)
    }).catch(() => {})
    getFarmacia(farmaciaId).then(setProfile).catch(() => {})
  }, [farmaciaId])

  const stats = useMemo(() => {
    const total = pedidos.length
    const ingresos = pedidos.reduce((s, o) => s + Number(o.subtotal) + Number(o.iva || 0), 0)
    const envios = pedidos.reduce((s, o) => s + Number(o.cargo_dron), 0)
    const cantEnvios = pedidos.filter(o => Number(o.cargo_dron) > 0).length
    const preparando = pedidos.filter(o => o.estado_pedido === 'Preparando').length
    const preparados = pedidos.filter(o => o.estado_pedido === 'Preparado').length
    const enTransito = pedidos.filter(o => o.estado_pedido === 'En transito').length
    const entregado = pedidos.filter(o => o.estado_pedido === 'Entregado').length
    return { total, ingresos, envios, cantEnvios, preparando, preparados, enTransito, entregado }
  }, [pedidos])

  const recentOrders = useMemo(() =>
    [...pedidos].sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)).slice(0, 5),
    [pedidos]
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">
            {profile?.nombre_comercial || 'Mi Farmacia'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold ${profile?.estado_operativo !== false ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
            <span className={`w-2 h-2 rounded-full ${profile?.estado_operativo !== false ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {profile?.estado_operativo !== false ? 'Abierto' : 'Cerrado'}
          </span>
          <button
            onClick={toggleOpen}
            disabled={toggling}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 ${
              profile?.estado_operativo !== false
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {toggling ? '...' : profile?.estado_operativo !== false ? 'Cerrar farmacia' : 'Abrir farmacia'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <div className="relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-[0.06] rounded-full -mr-10 -mt-10" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            {stats.total > 0 && (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {Math.round(stats.ingresos / stats.total)}/ped
              </span>
            )}
          </div>
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Ingresos</div>
          <div className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] tracking-tight">{formatCurrency(stats.ingresos)}</div>
        </div>

        <div className="relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400 to-sky-600 opacity-[0.06] rounded-full -mr-10 -mt-10" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </div>
            {stats.cantEnvios > 0 && (
              <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                {stats.cantEnvios} env{stats.cantEnvios !== 1 ? 'íos' : 'ío'}
              </span>
            )}
          </div>
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Envíos</div>
          <div className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] tracking-tight">{formatCurrency(stats.envios)}</div>
        </div>

        <div className="relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400 to-violet-600 opacity-[0.06] rounded-full -mr-10 -mt-10" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            {stats.total > 0 && (
              <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">total</span>
            )}
          </div>
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Pedidos</div>
          <div className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] tracking-tight">{stats.total}</div>
        </div>

        <div className="relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400 to-blue-600 opacity-[0.06] rounded-full -mr-10 -mt-10" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            {stats.total > 0 && (
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {Math.round((stats.entregado / stats.total) * 100)}% compl.
              </span>
            )}
          </div>
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Entregados</div>
          <div className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] tracking-tight">{stats.entregado}</div>
          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${stats.total > 0 ? (stats.entregado / stats.total) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[1.6fr_1fr]">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Pedidos recientes</h3>
            <span className="text-[11px] text-gray-400">{stats.total} en total</span>
          </div>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="text-left pb-3 px-5">Orden</th>
                  <th className="text-left pb-3 pr-4">Total</th>
                  <th className="text-left pb-3 pr-4">Estado</th>
                  <th className="text-left pb-3 pr-5">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const st = statusPalette[o.estado_pedido] || statusPalette['Preparando']
                  return (
                    <tr key={o.id_pedido} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-5 text-blue-600 font-semibold whitespace-nowrap">#{o.id_pedido}</td>
                      <td className="py-3 pr-4 text-gray-800 font-semibold whitespace-nowrap">{formatCurrency(o.total)}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1.5 ${st.bg} ${st.text} ${st.border} border rounded-full px-2.5 py-0.5 text-[10px] font-semibold`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {o.estado_pedido}
                        </span>
                      </td>
                      <td className="py-3 pr-5 text-gray-400 text-xs whitespace-nowrap">
                        {o.fecha_creacion ? new Date(o.fecha_creacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : ''}
                      </td>
                    </tr>
                  )
                })}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-gray-300 text-sm font-medium">
                      <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      Sin pedidos aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans'] mb-4">Resumen</h3>
          {profile ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  {profile.logo_url ? (
                    <img src={profile.logo_url} alt="" className="w-10 h-10 object-contain" />
                  ) : (
                    <span className="text-xl font-bold bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent">{profile.nombre_comercial?.charAt(0) || 'F'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">{profile.nombre_comercial}</div>
                  <div className="text-xs text-gray-400 truncate">{profile.ciudad} · {profile.telefono}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Preparando', value: stats.preparando, color: 'from-sky-400 to-blue-500', bg: 'bg-sky-50' },
                  { label: 'Listos', value: stats.preparados, color: 'from-emerald-400 to-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'En tránsito', value: stats.enTransito, color: 'from-indigo-400 to-indigo-500', bg: 'bg-indigo-50' },
                  { label: 'Entregados', value: stats.entregado, color: 'from-slate-400 to-slate-500', bg: 'bg-slate-50' },
                ].map(item => (
                  <div key={item.label} className={`${item.bg} rounded-xl p-3 border border-transparent`}>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="text-lg font-bold text-gray-900">{item.value}</div>
                    <div className="mt-1.5 h-1 bg-white/60 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${item.color} rounded-full`} style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm font-medium">
              <svg className="w-8 h-8 mr-2 animate-spin text-gray-200" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Cargando...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}