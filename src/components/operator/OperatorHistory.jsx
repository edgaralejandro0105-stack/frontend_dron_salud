import { useState, useMemo } from 'react'
import { ordersData, users } from '../../data/adminData'
import Badge from '../ui/Badge'

function formatCurrency(n) {
  return '$' + n.toLocaleString()
}

export default function OperatorHistory() {
  const [selected, setSelected] = useState(null)

  const deliveredOrders = useMemo(
    () => ordersData.filter((o) => o.estado === 'Entregado'),
    []
  )

  const order = selected
    ? ordersData.find((o) => o.id === selected)
    : null

  const client = order
    ? users.find((u) => u.id === order.clienteId)
    : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Historial de Entregas</h2>
          <p className="text-sm text-gray-500 mt-1">
            {deliveredOrders.length} pedido{deliveredOrders.length !== 1 ? 's' : ''} entregado{deliveredOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[1fr_1fr]">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                  <th className="text-left pb-3 pr-4">Orden</th>
                  <th className="text-left pb-3 pr-4">Farmacia</th>
                  <th className="text-left pb-3 pr-4">Cliente</th>
                  <th className="text-left pb-3 pr-4">Total</th>
                  <th className="text-left pb-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {deliveredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400 text-sm">
                      No hay entregas registradas
                    </td>
                  </tr>
                ) : (
                  deliveredOrders.map((o, i) => {
                    const c = users.find((u) => u.id === o.clienteId)
                    return (
                      <tr
                        key={o.id}
                        onClick={() => setSelected(selected === o.id ? null : o.id)}
                        className={`border-b border-gray-50 transition-colors cursor-pointer ${
                          selected === o.id ? 'bg-indigo-50' : 'hover:bg-indigo-50'
                        }`}
                      >
                        <td className="py-3 pr-4 text-indigo-600 font-semibold whitespace-nowrap">{o.id}</td>
                        <td className="py-3 pr-4 text-gray-800 font-medium">{o.farmacia}</td>
                        <td className="py-3 pr-4 text-gray-800">{c?.nombre || 'Cliente'}</td>
                        <td className="py-3 pr-4 text-gray-800 font-semibold whitespace-nowrap">{formatCurrency(o.total)}</td>
                        <td className="py-3 text-gray-500 text-xs whitespace-nowrap">{o.fecha}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          {order ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">{order.id}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{order.fecha}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Farmacia</div>
                  <div className="text-sm font-bold text-gray-800">{order.farmacia}</div>
                </div>
                {client && (
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-4 border border-blue-200">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Cliente</div>
                    <div className="text-sm font-bold text-gray-800">{client.nombre}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{client.telefono}</div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Productos</div>
                <div className="space-y-2">
                  {order.productos.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl p-3">
                      <div>
                        <div className="font-semibold text-gray-800">{p.nombre}</div>
                        <div className="text-xs text-gray-500">x{p.cantidad}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">{formatCurrency(p.precio * p.cantidad)}</div>
                        <div className="text-[10px] text-gray-400">{formatCurrency(p.precio)} c/u</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Envio</span><span>{formatCurrency(order.cargo_dron)}</span></div>
                <div className="flex justify-between text-gray-600"><span>IVA</span><span>{formatCurrency(order.iva)}</span></div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-800">{formatCurrency(order.total)}</span>
                </div>
              </div>

              {order.destino && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Destino de entrega</div>
                  <div className="text-sm font-semibold text-gray-800">{order.destino.nombre}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{order.destino.direccion}</div>
                </div>
              )}

              <div className="text-xs text-gray-400 text-center pt-2 space-y-1">
                {order.operador && <div>Operador: {order.operador}</div>}
                {order.dron && order.dron !== '—' && <div>Dron: {order.dron}</div>}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-400">
              <p className="text-sm font-semibold">Selecciona una entrega</p>
              <p className="text-xs">Haz clic en un pedido para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
