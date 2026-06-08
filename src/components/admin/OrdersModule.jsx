import { useState } from 'react'
import { ordersData, pharmacyProfiles } from '../../data/adminData'
import Badge from '../ui/Badge'

function formatCurrency(n) {
  return '$' + n.toLocaleString()
}

export default function OrdersModule() {
  const [selected, setSelected] = useState(null)

  const order = selected
    ? ordersData.find(o => o.id === selected)
    : null

  const profile = order
    ? pharmacyProfiles.find(p => p.id === order.farmaciaId)
    : null

  return (
    <>
      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[1fr_1fr]">
        <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Pedidos Recientes</h3>
            <button className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.97]">
              + Nuevo Pedido
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                  <th className="text-left pb-3 pr-4">Orden</th>
                  <th className="text-left pb-3 pr-4">Farmacia</th>
                  <th className="text-left pb-3 pr-4">Items</th>
                  <th className="text-left pb-3 pr-4">Estado</th>
                  <th className="text-left pb-3">Dron</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.map((order, i) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelected(selected === order.id ? null : order.id)}
                    className={`border-b border-gray-50 transition-colors cursor-pointer animate-fade-in ${
                      selected === order.id ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'
                    }`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="py-3 pr-4 text-blue-600 font-semibold">{order.id}</td>
                    <td className="py-3 pr-4 text-gray-800 font-medium">{order.farmacia}</td>
                    <td className="py-3 pr-4 text-gray-800 font-semibold">{order.productos.length}</td>
                    <td className="py-3 pr-4"><Badge text={order.estado} /></td>
                    <td className="py-3 text-gray-600 font-medium">{order.dron}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          {order ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Detalle del Pedido</h3>
                <Badge text={order.estado} />
              </div>

              {/* Pharmacy info */}
              {profile && (
                <div className="bg-gradient-to-br from-sky-50/50 to-blue-50/50 rounded-2xl p-5 space-y-3 border border-indigo-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {profile.nombre.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{profile.nombre}</div>
                      <div className="text-xs text-gray-500">{profile.ciudad}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-gray-500 font-semibold uppercase tracking-widest mb-0.5">Dirección</div>
                      <div className="text-gray-800 font-semibold">{profile.direccion}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-semibold uppercase tracking-widest mb-0.5">Teléfono</div>
                      <div className="text-gray-800 font-semibold">{profile.telefono}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products table */}
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">Productos</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                        <th className="text-left pb-2 pr-3">Producto</th>
                        <th className="text-center pb-2 pr-3">Cant.</th>
                        <th className="text-right pb-2 pr-3">P. Unit</th>
                        <th className="text-right pb-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.productos.map((p, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-b-0">
                          <td className="py-2.5 pr-3 text-gray-800 font-semibold">{p.nombre}</td>
                          <td className="py-2.5 pr-3 text-center text-gray-600">{p.cantidad}</td>
                          <td className="py-2.5 pr-3 text-right text-gray-600">{formatCurrency(p.precio)}</td>
                          <td className="py-2.5 text-right text-gray-800 font-semibold">{formatCurrency(p.cantidad * p.precio)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="pt-4 text-right text-xs text-gray-500">Subtotal</td>
                        <td className="pt-4 text-right text-sm text-gray-800">{formatCurrency(order.subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="pt-1 text-right text-xs text-gray-500">Cargo de envío (dron)</td>
                        <td className="pt-1 text-right text-sm text-gray-800">{formatCurrency(order.cargo_dron)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="pt-1 text-right text-xs text-gray-500">IVA 16%</td>
                        <td className="pt-1 text-right text-sm text-gray-800">{formatCurrency(order.iva)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="pt-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-widest border-t border-gray-100">Total</td>
                        <td className="pt-3 text-right text-lg font-bold gradient-text">{formatCurrency(order.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-400">
              <span className="text-4xl mb-3">📋</span>
              <p className="text-sm font-semibold">Selecciona un pedido</p>
              <p className="text-xs">Haz clic en una orden para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

