import { useState, useMemo } from 'react'
import { ordersData, pharmacyProfiles } from '../../data/adminData'

function formatCurrency(n) {
  return '$' + n.toLocaleString()
}

export default function PurchaseHistoryPage({ user }) {
  const [selected, setSelected] = useState(null)

  const purchases = useMemo(() =>
    ordersData
      .filter(o => o.clienteId === user?.id)
      .sort((a, b) => {
        const [da, ta] = a.fecha.split(' ')
        const [db, tb] = b.fecha.split(' ')
        const [d1, m1, y1] = da.split('/')
        const [d2, m2, y2] = db.split('/')
        const dateA = new Date(`${y1}-${m1}-${d1}T${ta}`)
        const dateB = new Date(`${y2}-${m2}-${d2}T${tb}`)
        return dateB - dateA
      }),
    [user?.id]
  )

  const order = selected ? ordersData.find(o => o.id === selected) : null
  const profile = order ? pharmacyProfiles.find(p => p.id === order.farmaciaId) : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Mis Compras</h2>
          <p className="text-sm text-gray-500 mt-1">Tus pedidos realizados</p>
        </div>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
          <span className="text-5xl block mb-4">&#128203;</span>
          <p className="text-sm font-semibold">No tienes compras aun</p>
          <p className="text-xs mt-1">Los pedidos que realices apareceran aqui</p>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 xl:grid-cols-[1fr_1fr]">
          <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                    <th className="text-left pb-3 pr-4">Orden</th>
                    <th className="text-left pb-3 pr-4">Fecha</th>
                    <th className="text-left pb-3 pr-4">Farmacia</th>
                    <th className="text-left pb-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((o, i) => {
                    const p = pharmacyProfiles.find(ph => ph.id === o.farmaciaId)
                    return (
                      <tr
                        key={o.id}
                        onClick={() => setSelected(selected === o.id ? null : o.id)}
                        className={`border-b border-gray-50 transition-colors cursor-pointer animate-fade-in ${
                          selected === o.id ? 'bg-blue-50' : 'hover:bg-blue-50'
                        }`}
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <td className="py-3 pr-4 text-blue-600 font-semibold whitespace-nowrap">{o.id}</td>
                        <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">{o.fecha}</td>
                        <td className="py-3 pr-4 text-gray-800 font-medium">{p?.nombre || o.farmacia}</td>
                        <td className="py-3 text-gray-800 font-semibold whitespace-nowrap">{formatCurrency(o.total)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
            {order ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Detalle {order.id}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{order.fecha}</p>
                </div>

                {profile && (
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                        {profile.nombre.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">{profile.nombre}</div>
                        <div className="text-xs text-gray-500">{profile.direccion}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Productos</div>
                  {order.productos.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl p-3">
                      <div>
                        <div className="font-semibold text-gray-800">{p.nombre}</div>
                        <div className="text-xs text-gray-500">&times; {p.cantidad}</div>
                      </div>
                      <div className="font-semibold text-gray-800">{formatCurrency(p.precio * p.cantidad)}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Envio</span><span>{formatCurrency(order.cargo_dron)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>IVA</span><span>{formatCurrency(order.iva)}</span></div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                    <span className="text-gray-900">Total</span>
                    <span className="bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {order.destino && (
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Destino de entrega</div>
                    <div className="text-sm font-semibold text-gray-800">{order.destino.nombre}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{order.destino.direccion}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-400">
                <span className="text-4xl mb-3">&#128203;</span>
                <p className="text-sm font-semibold">Selecciona una compra</p>
                <p className="text-xs">Haz clic en una orden para ver detalles</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
