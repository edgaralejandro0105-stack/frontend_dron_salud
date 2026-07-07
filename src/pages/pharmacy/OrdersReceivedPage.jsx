import { useState, useMemo, useEffect } from 'react'
import { getPedidos, updateEstado, confirmarPago } from '../../api'
import Badge from '../../components/ui/Badge'
import logo from '../../assets/Dron_Salud.png'

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function PharmacyInstructions({ order, onClose }) {


  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-start bg-gradient-to-br from-emerald-800 via-teal-900 to-green-900 overflow-y-auto" style={{ backgroundSize: '200% 200%' }}>
      <div className="w-full max-w-lg mx-auto text-center animate-fade-in py-6 sm:py-8 px-4">
        <div className="mb-4 sm:mb-6">
          <img src={logo} alt="Dron Salud" className="w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 object-contain animate-float mx-auto" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-['Plus_Jakarta_Sans'] mb-1 sm:mb-2">Pedido Preparado</h2>
        <p className="text-emerald-200 text-xs sm:text-sm mb-4 sm:mb-8">El pedido esta preparado, el operador asignara un dron</p>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 text-left mb-4 sm:mb-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-[10px] sm:text-sm">1</div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Prepara el pedido</div>
                <div className="text-[10px] sm:text-xs text-emerald-200 mt-0.5">Verifica los productos y asegurate de que coincidan con la orden.</div>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-[10px] sm:text-sm">2</div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Empaca de forma segura</div>
                <div className="text-[10px] sm:text-xs text-emerald-200 mt-0.5">Coloca los productos en el compartimento del dron.</div>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-[10px] sm:text-sm">3</div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Coloca el dron en la plataforma</div>
                <div className="text-[10px] sm:text-xs text-emerald-200 mt-0.5">Ubica el dron en la plataforma de despegue designada.</div>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-[10px] sm:text-sm">4</div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Alejate para el despegue</div>
                <div className="text-[10px] sm:text-xs text-emerald-200 mt-0.5">Mantente a una distancia segura durante el despegue.</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/10 text-left mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-bold text-white">Resumen de la orden</span>
            <span className="text-[10px] sm:text-xs text-emerald-300">{(order.detalles || []).reduce((s, i) => s + i.cantidad, 0)} producto{(order.detalles || []).reduce((s, i) => s + i.cantidad, 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-1 text-[10px] sm:text-xs">
            {(order.detalles || []).map((p, i) => (
              <div key={i} className="flex justify-between text-emerald-100 gap-2">
                <span className="text-left truncate">{p.nombre_producto} x {p.cantidad}</span>
                <span className="font-semibold text-white flex-shrink-0">{formatCurrency(Number(p.precio_unitario) * p.cantidad)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-2 sm:mt-3 pt-2 sm:pt-3 flex justify-between text-xs sm:text-sm">
            <span className="font-bold text-white">Total</span>
            <span className="font-bold text-emerald-300">{formatCurrency(order.total)}</span>
          </div>
        </div>
        <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 active:scale-[0.97] text-sm sm:text-base">
          Volver a ordenes
        </button>
      </div>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-4 w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <p className="text-gray-800 text-sm font-semibold text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg">Confirmar</button>
        </div>
      </div>
    </div>
  )
}

export default function OrdersReceivedPage({ user }) {
  const farmaciaId = user?.id_farmacia
  const [pedidos, setPedidos] = useState([])
  const [selected, setSelected] = useState(null)
  const [showInstructions, setShowInstructions] = useState(null)
  const [confirmReady, setConfirmReady] = useState(null)
  const [confirmPayment, setConfirmPayment] = useState(null)

  useEffect(() => {
    if (!farmaciaId) return
    loadOrders()
    const interval = setInterval(loadOrders, 10000)
    return () => clearInterval(interval)
  }, [farmaciaId])

  function loadOrders() {
    getPedidos({ id_farmacia: farmaciaId, limit: 1000 }).then(data => {
      const list = Array.isArray(data) ? data : (data?.pedidos || data?.data || [])
      setPedidos(list)
    }).catch(() => {})
  }

  const order = selected ? pedidos.find(o => o.id_pedido === selected) : null

  async function markReady(id) {
    try {
      await updateEstado(id, 'Preparado')
      setPedidos(prev => prev.map(o => o.id_pedido === id ? { ...o, estado_pedido: 'Preparado' } : o))
      setConfirmReady(null)
      setShowInstructions(id)
    } catch (err) {
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Error al actualizar')
    }
  }

  async function handleConfirmPayment(id) {
    try {
      const pedido = pedidos.find(o => o.id_pedido === id)
      if (pedido?.pago?.id_pago) {
        await confirmarPago(pedido.pago.id_pago)
      }
      setPedidos(prev => prev.map(o => o.id_pedido === id ? { ...o, estado_pedido: 'Pagado' } : o))
      setConfirmPayment(null)
      setSelected(id)
    } catch (err) {
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Error al confirmar pago')
    }
  }

  const sortedOrders = useMemo(
    () => [...pedidos]
      .filter(o => o.estado_pedido !== 'Entregado' && o.estado_pedido !== 'Cancelado')
      .sort((a, b) => {
        const priority = { 'Preparando': -1, 'Pendiente': 0, 'Pagado': 1, 'Preparado': 2, 'En transito': 3 }
        return (priority[a.estado_pedido] ?? 9) - (priority[b.estado_pedido] ?? 9)
      }),
    [pedidos]
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Ordenes Recibidas</h2>
          <p className="text-sm text-gray-500 mt-1">{sortedOrders.length} orden{sortedOrders.length !== 1 ? 'es' : ''} activa{sortedOrders.length !== 1 ? 's' : ''}</p>
        </div>
        <span className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold rounded-full px-4 py-1.5 shadow-md">
          {pedidos.filter(o => o.estado_pedido === 'Pendiente' || o.estado_pedido === 'Pagado' || o.estado_pedido === 'Preparado').length} activas
        </span>
      </div>

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[1fr_1fr]">
        <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
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
                  <tr><td colSpan="4" className="py-12 text-center text-gray-400 text-sm">No hay ordenes recibidas</td></tr>
                ) : (
                  sortedOrders.map((o, i) => (
                    <tr key={o.id_pedido} onClick={() => setSelected(selected === o.id_pedido ? null : o.id_pedido)}
                      className={`border-b border-gray-50 transition-colors cursor-pointer animate-fade-in ${selected === o.id_pedido ? 'bg-emerald-50' : 'hover:bg-emerald-50'}`}
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <td className="py-3 pr-4 text-emerald-600 font-semibold whitespace-nowrap">#{o.id_pedido}</td>
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

        <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          {order ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">#{order.id_pedido}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{order.fecha_creacion ? new Date(order.fecha_creacion).toLocaleDateString('es-ES') : ''}</p>
                </div>
                <Badge text={order.estado_pedido} />
              </div>

              {order.cliente && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                  <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Datos del cliente
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-semibold text-gray-800">{order.cliente.nombre} {order.cliente.apellido || ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="7" width="18" height="14" rx="2" ry="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7 10h4M7 14h6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-gray-600 font-mono">{order.cliente.cedula || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">{order.cliente.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-600">{order.cliente.telefono || '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Productos</div>
                <div className="space-y-2">
                  {(order.detalles || []).map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        {p.producto?.foto_url ? (
                          <img src={p.producto.foto_url} alt="" className="w-8 h-8 rounded-lg border border-gray-200 object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm flex-shrink-0 font-bold text-emerald-500">Rx</div>
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
                  <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">{formatCurrency(order.total)}</span>
                </div>
              </div>

              {(order.destino_nombre || order.destino_direccion) && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Destino de entrega</div>
                  <div className="text-sm font-semibold text-gray-800">{order.destino_nombre || 'Dirección'}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{order.destino_direccion}</div>
                </div>
              )}

              {order.estado_pedido === 'Preparando' && (
                <div className="pt-2 space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold">Revisa el pago y los productos</p>
                      <p className="mt-1.5 font-mono font-bold text-base">Ref: {order.pago?.referencia || '—'}</p>
                    </div>
                  </div>
                  <button onClick={() => setConfirmReady(order.id_pedido)} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.97]">
                    Listo para recolección
                  </button>
                </div>
              )}

              {order.estado_pedido === 'Pendiente' && (
                <div className="pt-2 space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div className="text-[11px] text-amber-800">
                      <p>El cliente ha enviado el comprobante de pago.</p>
                      <p className="mt-1.5 font-mono font-bold">Ref: {order.pago?.referencia || '—'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-rose-600 font-semibold leading-relaxed text-center px-2 py-2 bg-rose-50 rounded-xl border border-rose-200">
                    ⚠ Si el monto no es exacto o hay problemas con la transacción, comunícate con el cliente al {order.cliente?.telefono || '—'}.
                  </p>
                  <button onClick={() => setConfirmPayment(order.id_pedido)} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.97]">
                    Confirmar Pago Recibido
                  </button>
                </div>
              )}

              {(order.estado_pedido === 'Pagado' || order.estado_pedido === 'Preparado') && (
                <div className="pt-2">
                  {order.estado_pedido === 'Pagado' && (
                    <button onClick={() => setConfirmReady(order.id_pedido)} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.97]">
                      Preparado
                    </button>
                  )}
                  {order.estado_pedido === 'Preparado' && (
                    <div className="flex items-center justify-center text-amber-600 text-sm font-semibold bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
                      Pedido preparado, esperando operador
                    </div>
                  )}
                </div>
              )}

              {(order.estado_pedido === 'Entregado' || order.estado_pedido === 'En transito') && (
                <div className="pt-2">
                  <div className="text-gray-500 text-sm bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-center">
                    {order.estado_pedido === 'Entregado' ? 'Orden entregada al cliente' : 'Dron en camino al destino'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-400">
              <p className="text-sm font-semibold">Selecciona una orden</p>
              <p className="text-xs">Haz clic en una orden para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>

      {confirmPayment && (
        <ConfirmModal message="¿Confirmas que has recibido la transferencia del cliente?" onConfirm={() => handleConfirmPayment(confirmPayment)} onCancel={() => setConfirmPayment(null)} />
      )}
      {confirmReady && (
        <ConfirmModal message="¿Estas seguro de marcar esta orden como preparada?" onConfirm={() => markReady(confirmReady)} onCancel={() => setConfirmReady(null)} />
      )}

      {showInstructions && (() => {
        const ord = pedidos.find(o => o.id_pedido === showInstructions)
        if (!ord) return null
        return <PharmacyInstructions order={ord} onClose={() => setShowInstructions(null)} />
      })()}
    </div>
  )
}
