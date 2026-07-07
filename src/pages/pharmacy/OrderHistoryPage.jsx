import { useState, useEffect, useCallback } from 'react'
import { getPedidos } from '../../api'

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatFecha(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' +
    d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const PAGE_SIZE = 10

const estadoOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Pagado', label: 'Pagado' },
  { value: 'Preparado', label: 'Preparado' },
  { value: 'En transito', label: 'En tránsito' },
  { value: 'Entregado', label: 'Entregado' },
  { value: 'Cancelado', label: 'Cancelado' },
]

export default function OrderHistoryPage({ user }) {
  const [pedidos, setPedidos] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const farmaciaId = user?.id_farmacia

  const loadPedidos = useCallback((p = 1, s = search, e = estadoFilter) => {
    if (!farmaciaId) return
    const params = { id_farmacia: farmaciaId, page: p, limit: PAGE_SIZE }
    if (s) params.search = s
    if (e) params.estado_pedido = e
    getPedidos(params)
      .then(data => {
        if (Array.isArray(data)) setPedidos(data)
        else if (data?.pedidos) setPedidos(data.pedidos)
        else if (data?.data) { setPedidos(data.data); setTotal(data.total || 0); setTotalPages(data.totalPages || 1); setPage(data.page || 1) }
      })
      .catch(() => {})
  }, [farmaciaId, search, estadoFilter])

  useEffect(() => { loadPedidos(1) }, [loadPedidos])
  useEffect(() => { const timer = setTimeout(() => setSearch(searchInput), 400); return () => clearTimeout(timer) }, [searchInput])

  const order = selected ? pedidos.find(o => o.id_pedido === selected) : null

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Historial de Pedidos</h2>
          <p className="text-sm text-gray-500 mt-1">{total} pedido{total !== 1 ? 's' : ''} en total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Buscar por # orden..." className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all w-52" />
          </div>
          <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all">
            {estadoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
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
                  <th className="text-left pb-3 pr-4">Estado</th>
                  <th className="text-left pb-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr><td colSpan="5" className="py-12 text-center text-gray-400 text-sm">No hay pedidos</td></tr>
                ) : (
                  pedidos.map(o => (
                    <tr key={o.id_pedido} onClick={() => setSelected(selected === o.id_pedido ? null : o.id_pedido)} className={`border-b border-gray-50 transition-colors cursor-pointer ${selected === o.id_pedido ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                      <td className="py-3 pr-4 text-gray-800 font-semibold whitespace-nowrap">#{o.id_pedido}</td>
                      <td className="py-3 pr-4 text-gray-600">{(o.detalles || []).length}</td>
                      <td className="py-3 pr-4 text-gray-800 font-semibold whitespace-nowrap">{formatCurrency(o.total)}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          o.estado_pedido === 'Entregado' ? 'bg-emerald-50 text-emerald-700' :
                          o.estado_pedido === 'Cancelado' ? 'bg-red-50 text-red-600' :
                          o.estado_pedido === 'En transito' ? 'bg-sky-50 text-sky-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>{o.estado_pedido}</span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs whitespace-nowrap">{formatFecha(o.fecha_creacion)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Mostrando página {page} de {totalPages} ({total} pedidos)</p>
              <div className="flex items-center gap-1">
                <button onClick={() => loadPedidos(page - 1)} disabled={page <= 1} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Anterior</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => loadPedidos(p)} className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${p === page ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-teal-500/20' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
                ))}
                <button onClick={() => loadPedidos(page + 1)} disabled={page >= totalPages} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Siguiente</button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          {order ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">#{order.id_pedido}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatFecha(order.fecha_creacion)}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  order.estado_pedido === 'Entregado' ? 'bg-emerald-50 text-emerald-700' :
                  order.estado_pedido === 'Cancelado' ? 'bg-red-50 text-red-600' :
                  order.estado_pedido === 'En transito' ? 'bg-sky-50 text-sky-700' :
                  'bg-amber-50 text-amber-700'
                }`}>{order.estado_pedido}</span>
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

              <div className="text-xs text-gray-400 text-center pt-2">Pedido finalizado</div>
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
