import { useState, useMemo, useEffect, useRef } from 'react'
import { ordersData, pharmacyProfiles } from '../../data/adminData'

function formatCurrency(n) {
  return '$' + n.toLocaleString()
}

export default function PharmacyDashboard({ user }) {
  const farmaciaId = user?.farmaciaId || 'FARM-001'
  const fileRef = useRef(null)

  const [profilePic, setProfilePic] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('pharmacy_pic_' + farmaciaId)
    if (saved) setProfilePic(saved)
  }, [farmaciaId])

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setProfilePic(dataUrl)
      localStorage.setItem('pharmacy_pic_' + farmaciaId, dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const profile = pharmacyProfiles.find((p) => p.id === farmaciaId)

  const pharmacyOrders = useMemo(
    () => ordersData.filter((o) => o.farmaciaId === farmaciaId),
    [farmaciaId]
  )

  const totalIngresos = pharmacyOrders.reduce((sum, o) => sum + o.total, 0)
  const preparando = pharmacyOrders.filter((o) => o.estado === 'Preparando').length
  const preparados = pharmacyOrders.filter((o) => o.estado === 'Preparado').length
  const enTransito = pharmacyOrders.filter((o) => o.estado === 'En tránsito').length
  const entregado = pharmacyOrders.filter((o) => o.estado === 'Entregado').length
  const activas = preparando + preparados + enTransito

  const recentOrders = [...pharmacyOrders]
    .sort((a, b) => {
      const da = a.fecha.split('/').reverse().join('')
      const db = b.fecha.split('/').reverse().join('')
      return db.localeCompare(da)
    })
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Total Pedidos</div>
          <div className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">{pharmacyOrders.length}</div>
          <div className="mt-2 text-xs text-gray-400">
            {entregado} entregados, {activas} activos
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Ingresos Totales</div>
          <div className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">{formatCurrency(totalIngresos)}</div>
          <div className="mt-2 text-xs text-gray-400">
            {pharmacyOrders.length > 0
              ? 'Promedio: ' + formatCurrency(Math.round(totalIngresos / pharmacyOrders.length)) + ' por pedido'
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
              ? Math.round((entregado / pharmacyOrders.length) * 100) + '% del total'
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
                  <tr key={o.id} className="border-b border-gray-50">
                    <td className="py-3 pr-4 text-gray-800 font-semibold whitespace-nowrap">{o.id}</td>
                    <td className="py-3 pr-4 text-gray-800 whitespace-nowrap">{formatCurrency(o.total)}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block border rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        o.estado === 'Entregado' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                        o.estado === 'En tránsito' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        o.estado === 'Preparado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {o.estado}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-xs whitespace-nowrap">{o.fecha}</td>
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
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-md cursor-pointer overflow-hidden group ring-2 ring-emerald-200 hover:ring-emerald-400 transition-all duration-200"
                >
                  {profilePic ? (
                    <img src={profilePic} alt={profile.nombre} className="w-full h-full object-cover" />
                  ) : (
                    profile.nombre.charAt(0)
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                <div className="text-sm font-bold text-gray-800 mt-3">{profile.nombre}</div>
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
