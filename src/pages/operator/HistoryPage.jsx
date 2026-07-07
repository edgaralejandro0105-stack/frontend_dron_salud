import { useState, useEffect, useCallback } from 'react'
import { getPedidos } from '../../api'
import Badge from '../../components/ui/Badge'

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const PAGE_SIZE = 10

export default function OperatorHistoryPage() {
  const [pedidos, setPedidos] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState(null)

  const loadPedidos = useCallback((p = 1) => {
    getPedidos({ estado_pedido: 'Entregado', page: p, limit: PAGE_SIZE })
      .then(data => {
        if (Array.isArray(data)) setPedidos(data)
        else if (data?.pedidos) setPedidos(data.pedidos)
        else if (data?.data) { setPedidos(data.data); setTotal(data.total || 0); setTotalPages(data.totalPages || 1); setPage(data.page || 1) }
      })
      .catch(() => {})
  }, [])

  useEffect(() => { loadPedidos() }, [loadPedidos])

  const order = selected ? pedidos.find((o) => o.id_pedido === selected) : null
  const farmacia = order?.farmacia || null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Historial de Entregas</h2>
          <p className="text-sm text-gray-500 mt-1">
            {total} pedido{total !== 1 ? 's' : ''} entregado{total !== 1 ? 's' : ''}
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
                  <th className="text-left pb-3 pr-4">Total</th>
                  <th className="text-left pb-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-gray-400 text-sm">
                      No hay entregas registradas
                    </td>
                  </tr>
                ) : (
                  pedidos.map((o, i) => (
                    <tr
                      key={o.id_pedido}
                      onClick={() => setSelected(selected === o.id_pedido ? null : o.id_pedido)}
                      className={`border-b border-gray-50 transition-colors cursor-pointer ${
                        selected === o.id_pedido ? 'bg-indigo-50' : 'hover:bg-indigo-50'
                      }`}
                    >
                      <td className="py-3 pr-4 text-indigo-600 font-semibold whitespace-nowrap">#{o.id_pedido}</td>
                      <td className="py-3 pr-4 text-gray-800 font-medium">{o.farmacia?.nombre_comercial || `Farmacia #${o.id_farmacia}`}</td>
                      <td className="py-3 pr-4 text-gray-800 font-semibold whitespace-nowrap">{formatCurrency(o.total)}</td>
                      <td className="py-3 text-gray-500 text-xs whitespace-nowrap">{o.fecha_creacion ? new Date(o.fecha_creacion).toLocaleDateString('es-ES') : ''}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Mostrando página {page} de {totalPages} ({total} entregas)</p>
              <div className="flex items-center gap-1">
                <button onClick={() => loadPedidos(page - 1)} disabled={page <= 1} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Anterior</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => loadPedidos(p)} className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${p === page ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
                ))}
                <button onClick={() => loadPedidos(page + 1)} disabled={page >= totalPages} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Siguiente</button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          {order ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">#{order.id_pedido}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{order.fecha_creacion ? new Date(order.fecha_creacion).toLocaleDateString('es-ES') : ''}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {farmacia && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Farmacia</div>
                    <div className="text-sm font-bold text-gray-800">{farmacia.nombre_comercial}</div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Productos</div>
                <div className="space-y-2">
                  {(order.detalles || []).map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl p-3">
                      <div>
                        <div className="font-semibold text-gray-800">{p.nombre_producto}</div>
                        <div className="text-xs text-gray-500">x{p.cantidad}</div>
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

              {(order.destino_nombre || order.destino_direccion) && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Destino de entrega</div>
                  <div className="text-sm font-semibold text-gray-800">{order.destino_nombre || 'Dirección'}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{order.destino_direccion}</div>
                </div>
              )}

              <div className="text-xs text-gray-400 text-center pt-2 space-y-1">
                {order.operador && <div>Operador: {order.operador.nombre_operador || order.operador.nombre || ''} {order.operador.apellido || ''}</div>}
                {order.dron && <div>Dron: {order.dron.modelo || order.dron.nombre || `#${order.dron.id_dron}`}</div>}
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
