import { useState, useEffect, useMemo } from 'react'
import { getPedidos, getFarmacias, getOperadores } from '../../api'
import Badge from '../../components/ui/Badge'

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function OrdersPage() {
  const [selected, setSelected] = useState(null)
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroFarmacia, setFiltroFarmacia] = useState('')
  const [pedidos, setPedidos] = useState([])
  const [farmacias, setFarmacias] = useState([])
  const [operadores, setOperadores] = useState([])
  const [filtroOperador, setFiltroOperador] = useState('')

  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    Promise.all([getFarmacias(), getOperadores()])
      .then(([f, o]) => {
        if (Array.isArray(f)) setFarmacias(f)
        else if (f?.farmacias) setFarmacias(f.farmacias)
        if (Array.isArray(o)) setOperadores(o)
        else if (o?.operadores) setOperadores(o.operadores)
      })
      .catch((err) => {
        console.error('Error al cargar farmacias/operadores:', err)
      })
  }, [])

  useEffect(() => {
    setCargando(true)
    const params = {}
    if (filtroFechaDesde) params.desde = filtroFechaDesde
    if (filtroFechaHasta) params.hasta = filtroFechaHasta

    getPedidos(params)
      .then((p) => {
        if (Array.isArray(p)) setPedidos(p)
        else if (p?.pedidos) setPedidos(p.pedidos)
      })
      .catch((err) => {
        console.error('Error al cargar pedidos:', err)
      })
      .finally(() => setCargando(false))
  }, [filtroFechaDesde, filtroFechaHasta])

  const filteredOrders = useMemo(() => {
    return pedidos.filter(order => {
      if (filtroFarmacia) {
        const farmacia = farmacias.find(f => f.id_farmacia === order.id_farmacia)
        if (farmacia?.nombre_comercial !== filtroFarmacia) return false
      }
      if (filtroOperador) {
        const opName = order.operador
          ? `${order.operador.nombre_operador || order.operador.nombre || ''} ${order.operador.apellido || ''}`.trim()
          : order.despachador
            ? `${order.despachador.nombre || ''} ${order.despachador.apellido || ''}`.trim()
            : ''
        if (opName !== filtroOperador) return false
      }
      return true
    })
  }, [pedidos, filtroFechaDesde, filtroFechaHasta, filtroFarmacia, filtroOperador, farmacias])

  const order = selected
    ? pedidos.find(o => o.id_pedido === selected)
    : null

  const profile = order?.farmacia || null

  return (
    <>
      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[1fr_1fr]">
        <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Pedidos Recientes</h3>

          </div>
          {cargando && (
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 animate-pulse rounded-full" style={{ width: '100%' }} />
            </div>
          )}
          <div className="flex flex-wrap items-end gap-3 mb-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Desde</label>
              <input
                type="date"
                value={filtroFechaDesde}
                onChange={e => setFiltroFechaDesde(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Hasta</label>
              <input
                type="date"
                value={filtroFechaHasta}
                onChange={e => setFiltroFechaHasta(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Farmacia</label>
              <select
                value={filtroFarmacia}
                onChange={e => setFiltroFarmacia(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              >
                <option value="">Todas</option>
                {farmacias.map(p => (
                  <option key={p.id_farmacia} value={p.nombre_comercial}>{p.nombre_comercial}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Operador</label>
              <select
                value={filtroOperador}
                onChange={e => setFiltroOperador(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
              >
                <option value="">Todos</option>
                {[...new Map(
                  pedidos
                    .flatMap(o => {
                      const names = []
                      if (o.operador) names.push(`${o.operador.nombre_operador || o.operador.nombre || ''} ${o.operador.apellido || ''}`.trim())
                      if (o.despachador) names.push(`${o.despachador.nombre || ''} ${o.despachador.apellido || ''}`.trim())
                      return names
                    })
                    .filter(Boolean)
                    .map(name => [name, name])
                ).values()].map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            {(filtroFechaDesde || filtroFechaHasta || filtroFarmacia || filtroOperador) && (
              <button
                onClick={() => { setFiltroFechaDesde(''); setFiltroFechaHasta(''); setFiltroFarmacia(''); setFiltroOperador('') }}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.97]"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                  <th className="text-left pb-3 pr-4">Orden</th>
                  <th className="text-left pb-3 pr-4">Farmacia</th>
                  <th className="text-left pb-3 pr-4">Items</th>
                  <th className="text-left pb-3 pr-4">Estado</th>
                  <th className="text-left pb-3 pr-4">Fecha</th>
                  <th className="text-left pb-3 pr-4">Dron</th>
                  <th className="text-left pb-3 pr-4">Operador</th>
                  <th className="text-left pb-3">Despachado por</th>
                </tr>
              </thead>
              <tbody>
                  {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-sm text-gray-400 font-semibold">No se encontraron pedidos con los filtros seleccionados</td>
                  </tr>
                ) : (
                  filteredOrders.map((order, i) => (
                  <tr
                    key={order.id_pedido}
                    onClick={() => setSelected(selected === order.id_pedido ? null : order.id_pedido)}
                    className={`border-b border-gray-50 transition-colors cursor-pointer animate-fade-in ${
                      selected === order.id_pedido ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'
                    }`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="py-3 pr-4 text-blue-600 font-semibold">#{order.id_pedido}</td>
                    <td className="py-3 pr-4 text-gray-800 font-medium">{order.farmacia?.nombre_comercial || `Farmacia #${order.id_farmacia}`}</td>
                    <td className="py-3 pr-4 text-gray-800 font-semibold">{(order.detalles || []).length}</td>
                    <td className="py-3 pr-4"><Badge text={order.estado_pedido} /></td>
                    <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">{order.fecha_creacion ? new Date(order.fecha_creacion).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="py-3 pr-4 text-gray-600 font-medium">{order.dron?.modelo || order.dron?.nombre || (order.id_dron ? `#${order.id_dron}` : '—')}</td>
                    <td className="py-3 text-gray-600 font-medium">{order.operador ? `${order.operador.nombre_operador || order.operador.nombre || ''} ${order.operador.apellido || ''}`.trim() || `#${order.operador.id_operador}` : '—'}</td>
                    <td className="py-3 text-gray-600 font-medium">{order.despachador ? `${order.despachador.nombre || ''} ${order.despachador.apellido || ''}`.trim() : '—'}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
              {order ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Detalle del Pedido</h3>
                <Badge text={order.estado_pedido} />
              </div>

              {(order.operador || order.dron || order.despachador) && (
                <div className="flex gap-4 text-xs">
                  {order.operador && (
                    <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl px-4 py-3 border border-emerald-100/50 flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <div><span className="text-gray-500 font-semibold">Operador:</span> <span className="text-gray-800 font-bold">{order.operador.nombre_operador || order.operador.nombre || ''} {order.operador.apellido || ''}</span></div>
                    </div>
                  )}
                  {order.despachador && (
                    <div className="bg-gradient-to-br from-purple-50/50 to-violet-50/50 rounded-xl px-4 py-3 border border-purple-100/50 flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 0112 15c2.114 0 4.066.71 5.621 1.904M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <div><span className="text-gray-500 font-semibold">Despachado por:</span> <span className="text-gray-800 font-bold">{order.despachador.nombre || ''} {order.despachador.apellido || ''}</span></div>
                    </div>
                  )}
                  {order.dron && (
                    <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl px-4 py-3 border border-amber-100/50 flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <div><span className="text-gray-500 font-semibold">Dron:</span> <span className="text-gray-800 font-bold">{order.dron.modelo || order.dron.nombre}</span></div>
                    </div>
                  )}
                </div>
              )}

              {profile && (
                <div className="bg-gradient-to-br from-sky-50/50 to-blue-50/50 rounded-2xl p-5 space-y-3 border border-indigo-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {profile.nombre_comercial?.charAt(0) || 'F'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{profile.nombre_comercial}</div>
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

              {order.cliente && (
                <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl p-5 space-y-3 border border-amber-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {order.cliente.nombre?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{order.cliente.nombre} {order.cliente.apellido || ''}</div>
                      <div className="text-xs text-gray-500">Cliente</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-gray-500 font-semibold uppercase tracking-widest mb-0.5">Cédula</div>
                      <div className="text-gray-800 font-semibold">{order.cliente.cedula || '—'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-semibold uppercase tracking-widest mb-0.5">Teléfono</div>
                      <div className="text-gray-800 font-semibold">{order.cliente.telefono || '—'}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-500 font-semibold uppercase tracking-widest mb-0.5">Correo</div>
                      <div className="text-gray-800 font-semibold">{order.cliente.email}</div>
                    </div>
                  </div>
                </div>
              )}

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
                      {(order.detalles || []).map((p, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-b-0">
                          <td className="py-2.5 pr-3 text-gray-800 font-semibold">{p.nombre_producto}</td>
                          <td className="py-2.5 pr-3 text-center text-gray-600">{p.cantidad}</td>
                          <td className="py-2.5 pr-3 text-right text-gray-600">{formatCurrency(p.precio_unitario)}</td>
                          <td className="py-2.5 text-right text-gray-800 font-semibold">{formatCurrency(p.cantidad * Number(p.precio_unitario))}</td>
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
              <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-semibold">Selecciona un pedido</p>
              <p className="text-xs">Haz clic en una orden para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
