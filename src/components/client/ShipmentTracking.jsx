import { useMemo } from 'react'
import { ordersData, fleetData, pharmacyProfiles } from '../../data/adminData'
import Badge from '../ui/Badge'

function formatCurrency(n) {
  return '$' + n.toLocaleString()
}

const estadoPasos = {
  'Preparando': 1,
  'En tránsito': 2,
  'Entregado': 3,
}

function Timeline({ estado }) {
  const pasos = [
    { key: 'Preparando', label: 'Preparando pedido', icon: '📦' },
    { key: 'En tránsito', label: 'En camino', icon: '🚁' },
    { key: 'Entregado', label: 'Entregado', icon: '✅' },
  ]
  const current = estadoPasos[estado] || 0

  return (
    <div className="flex items-center gap-2">
      {pasos.map((paso, i) => (
        <div key={paso.key} className="flex items-center flex-1 last:flex-none">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            i < current ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            i === current ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' :
            'bg-gray-50 text-gray-400 border border-gray-100'
          }`}>
            <span>{paso.icon}</span>
            <span className="hidden sm:inline">{paso.label}</span>
          </div>
          {i < pasos.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 rounded-full ${
              i < current ? 'bg-emerald-400' : i === current ? 'bg-blue-300' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function ShipmentTracking({ user }) {
  const activeOrders = useMemo(() =>
    ordersData.filter(o => o.estado !== 'Entregado'),
  [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Seguimiento de Envíos</h2>
          <p className="text-sm text-gray-500 mt-1">Monitorea tus pedidos en tiempo real</p>
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
          <span className="text-5xl block mb-4">📦</span>
          <p className="text-sm font-semibold">No hay envíos activos</p>
          <p className="text-xs mt-1">Tus pedidos en camino aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {activeOrders.map((order, i) => {
            const profile = pharmacyProfiles.find(p => p.id === order.farmaciaId)
            const drone = fleetData.find(d => d.id === order.dron)

            return (
              <div
                key={order.id}
                className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    {profile && (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                        {profile.nombre.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-900 font-['Plus_Jakarta_Sans']">{order.id}</span>
                        <Badge text={order.estado} />
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">{profile?.nombre || order.farmacia}</div>
                    </div>
                  </div>

                  {order.destino && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Entrega en:</div>
                      <div className="text-sm font-semibold text-gray-800">{order.destino.nombre}</div>
                      <div className="text-xs text-gray-400">{order.destino.direccion}</div>
                    </div>
                  )}
                </div>

                <Timeline estado={order.estado} />

                <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    {drone ? (
                      <div className="flex items-center gap-2 bg-gray-50/80 rounded-xl px-3 py-2">
                        <span>🚁</span>
                        <span className="text-sm font-semibold text-gray-700">{drone.id}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          drone.bateria > 50 ? 'bg-emerald-500' : drone.bateria > 20 ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        <span className="text-xs text-gray-500">{drone.bateria}%</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">Asignando dron...</div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      <span className="text-xs text-gray-400">{order.productos.length} producto{order.productos.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="text-lg font-bold gradient-text">{formatCurrency(order.total)}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
