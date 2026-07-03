import { useState, useMemo, useEffect } from 'react'
import { getPedidos } from '../../api'

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function OrderHistoryPage({ user }) {
  const [pedidos, setPedidos] = useState([])
  const [selected, setSelected] = useState(null)

  const farmaciaId = user?.id_farmacia

  useEffect(() => {
    if (!farmaciaId) return
    getPedidos({ id_farmacia: farmaciaId })
      .then(data => {
        if (Array.isArray(data)) setPedidos(data)
        else if (data?.pedidos) setPedidos(data.pedidos)
      })
      .catch(() => {})
  }, [farmaciaId])

  const order = selected
    ? pedidos.find(o => o.id_pedido === selected)
    : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Historial de Pedidos</h2>
          <p className="text-sm text-gray-500 mt-1">
            {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} en total
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
                  <th className="text-left pb-3 pr-4">Items</th>
                  <th className="text-left pb-3 pr-4">Total</th>
                  <th className="text-left pb-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-gray-400 text-sm">
                      No hay pedidos
                    </td>
                  </tr>
                ) : (
                  pedidos.map((o, i) => (
                    <tr
                      key={o.id_pedido}
                      onClick={() => setSelected(selected === o.id_pedido ? null : o.id_pedido)}
                      className={`border-b border-gray-50 transition-colors cursor-pointer ${
                        selected === o.id_pedido ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-3 pr-4 text-gray-800 font-semibold whitespace-nowrap">#{o.id_pedido}</td>
                      <td className="py-3 pr-4 text-gray-600">{(o.detalles || []).length}</td>
                      <td className="py-3 pr-4 text-gray-800 font-semibold whitespace-nowrap">{formatCurrency(o.total)}</td>
                      <td className="py-3 text-gray-500 text-xs whitespace-nowrap">{o.fecha_creacion ? new Date(o.fecha_creacion).toLocaleDateString('es-ES') : ''}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          {order ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">#{order.id_pedido}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{order.fecha_creacion ? new Date(order.fecha_creacion).toLocaleDateString('es-ES') : ''}</p>
              </div>

              <div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Productos</div>
                <div className="space-y-2">
                  {(order.detalles || []).map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        {p.producto?.foto_url ? (
                          <img src={p.producto.foto_url} alt="" className="w-8 h-8 rounded-lg border border-gray-200 object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs flex-shrink-0 font-bold text-gray-400">Rx</div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-800">{p.nombre_producto}</div>
                          <div className="text-xs text-gray-500">x{p.cantidad}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">{formatCurrency(Number(p.precio_unitario) * p.cantidad)}</div>
                        <div className="text-[10px] text-gray-400">{formatCurrency(p.precio_unitario)} c/u</div>
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

              {order.cliente && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Cliente</div>
                  <div className="text-sm font-semibold text-gray-800">{order.cliente.nombre} {order.cliente.apellido}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{order.cliente.email}</div>
                  {order.cliente.telefono && <div className="text-xs text-gray-500">{order.cliente.telefono}</div>}
                  {order.cliente.cedula && <div className="text-xs text-gray-400 mt-1">C.I.: {order.cliente.cedula}</div>}
                </div>
              )}

              {(order.destino_nombre || order.destino_direccion) && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Destino de entrega</div>
                  <div className="text-sm font-semibold text-gray-800">{order.destino_nombre || 'Dirección'}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{order.destino_direccion}</div>
                </div>
              )}

              <div className="text-xs text-gray-400 text-center pt-2">
                Pedido finalizado
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-400">
              <p className="text-sm font-semibold">Selecciona un pedido</p>
              <p className="text-xs">Haz clic en un pedido para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
