import { useState } from 'react'
import { ordersData, pharmacyProfiles } from '../../data/adminData'
import Badge from '../../components/ui/Badge'

function formatCurrency(n) {
  return '$' + n.toLocaleString()
}

function parseDate(str) {
  const [d] = str.split(' ')
  const [day, month, year] = d.split('/')
  return new Date(+year, +month - 1, +day)
}

export default function OrdersPage() {
  const [selected, setSelected] = useState(null)
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroFarmacia, setFiltroFarmacia] = useState('')

  const filteredOrders = ordersData.filter(order => {
    if (filtroFechaDesde) {
      const desde = new Date(filtroFechaDesde)
      if (parseDate(order.fecha) < desde) return false
    }
    if (filtroFechaHasta) {
      const hasta = new Date(filtroFechaHasta)
      if (parseDate(order.fecha) > hasta) return false
    }
    if (filtroFarmacia && order.farmacia !== filtroFarmacia) return false
    return true
  })

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

          </div>
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
                {pharmacyProfiles.map(p => (
                  <option key={p.id} value={p.nombre}>{p.nombre}</option>
                ))}
              </select>
            </div>
            {(filtroFechaDesde || filtroFechaHasta || filtroFarmacia) && (
              <button
                onClick={() => { setFiltroFechaDesde(''); setFiltroFechaHasta(''); setFiltroFarmacia('') }}
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
                  <th className="text-left pb-3">Dron</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-sm text-gray-400 font-semibold">No se encontraron pedidos con los filtros seleccionados</td>
                  </tr>
                ) : (
                  filteredOrders.map((order, i) => (
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
                <Badge text={order.estado} />
              </div>

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
