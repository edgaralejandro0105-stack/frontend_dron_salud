import { useState, useMemo, useEffect } from 'react'
import { getPedidos } from '../../api'

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatFecha(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export default function PurchaseHistoryPage({ user }) {
  const [selected, setSelected] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pedidos, setPedidos] = useState([])

  useEffect(() => {
    getPedidos()
      .then(data => {
        if (Array.isArray(data)) setPedidos(data)
        else if (data?.pedidos) setPedidos(data.pedidos)
      })
      .catch(() => setPedidos([]))
  }, [])

  const purchases = useMemo(() => {
    let items = [...pedidos].sort((a, b) => {
      const dateA = new Date(a.fecha_creacion || 0)
      const dateB = new Date(b.fecha_creacion || 0)
      return dateB - dateA
    })

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(o =>
        String(o.id_pedido).includes(q) ||
        (o.farmacia?.nombre_comercial || '').toLowerCase().includes(q)
      )
    }

    return items
  }, [pedidos, searchQuery])

  const order = selected ? pedidos.find(o => o.id_pedido === selected) : null
  const profile = order?.farmacia || null

  const totalPurchases = pedidos.length

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Mis Compras</h1>
          <p className="text-sm text-slate-500 mt-1">{totalPurchases} pedido{totalPurchases !== 1 ? 's' : ''} realizados</p>
        </div>
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por orden o farmacia..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-20 text-slate-400 max-w-md mx-auto">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-semibold">
            {searchQuery ? 'No se encontraron pedidos' : 'No tienes compras aún'}
          </p>
          <p className="text-xs mt-1">
            {searchQuery ? 'Intenta con otro término de búsqueda' : 'Los pedidos que realices aparecerán aquí'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
          <div className="space-y-3">
            {purchases.map((o, i) => {
              const farmacia = o.farmacia
              const isSelected = selected === o.id_pedido
              return (
                <button
                  key={o.id_pedido}
                  onClick={() => setSelected(isSelected ? null : o.id_pedido)}
                  className={`w-full text-left bg-white rounded-2xl border p-4 transition-all duration-200 animate-fade-in ${
                    isSelected
                      ? 'border-sky-200 shadow-[0_4px_20px_rgba(14,165,233,0.1)]'
                      : 'border-slate-100 hover:border-sky-100 hover:shadow-sm'
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                      isSelected ? 'bg-gradient-to-br from-sky-500 to-blue-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {farmacia?.nombre_comercial?.charAt(0) || 'F'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-800 truncate">{farmacia?.nombre_comercial || `Farmacia #${o.id_farmacia}`}</span>
                        <span className="text-xs font-semibold text-blue-600 shrink-0">#{o.id_pedido}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{formatFecha(o.fecha_creacion)}</span>
                        <span className="text-sm font-bold text-slate-800">{formatCurrency(o.total)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 lg:sticky lg:top-6 h-fit">
            {order ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Detalle #{order.id_pedido}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{formatFecha(order.fecha_creacion)}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${
                    order.estado_pedido === 'Entregado' || order.estado_pedido === 'Completado' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {order.estado_pedido}
                  </span>
                </div>

                {profile && (
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-4 border border-sky-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                        {profile.nombre_comercial?.charAt(0) || 'F'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{profile.nombre_comercial}</div>
                        <div className="text-xs text-slate-500">{profile.direccion}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Productos</span>
                  </div>
                  <div className="space-y-2">
                    {(order.detalles || []).map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-slate-50 rounded-xl p-3">
                        <div>
                          <div className="font-semibold text-slate-800">{p.nombre_producto}</div>
                          <div className="text-xs text-slate-500">× {p.cantidad}</div>
                        </div>
                        <div className="font-semibold text-slate-800">{formatCurrency(Number(p.precio_unitario) * p.cantidad)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Envío (dron)</span><span>{formatCurrency(order.cargo_dron)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>IVA 16%</span><span>{formatCurrency(order.iva)}</span></div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200">
                    <span className="text-slate-900">Total</span>
                    <span className="bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {(order.destino_nombre || order.destino_direccion) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Destino</span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <div className="text-sm font-semibold text-slate-800">{order.destino_nombre || 'Dirección'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{order.destino_direccion}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
                <svg className="w-14 h-14 mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-semibold">Selecciona una compra</p>
                <p className="text-xs mt-1">Haz clic en un pedido para ver los detalles</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
