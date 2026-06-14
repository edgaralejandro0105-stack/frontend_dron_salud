import { useState, useMemo, useEffect } from 'react'
import { ordersData, pharmacyProfiles, users } from '../../data/adminData'
import Badge from '../../components/ui/Badge'
import logo from '../../assets/Dron_Salud.png'

const ORDER_STORAGE_KEY = 'dronSalud_orders'

function loadMergedOrders() {
  try {
    const saved = localStorage.getItem(ORDER_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const merged = [...ordersData]
      for (const dyn of parsed) {
        const idx = merged.findIndex((o) => o.id === dyn.id)
        if (idx >= 0) {
          if (dyn.estado === 'Pendiente' || dyn.estado === 'Pagado') {
            merged[idx] = dyn
          }
        } else {
          merged.push(dyn)
        }
      }
      return merged
    }
  } catch { /* ignore */ }
  return [...ordersData]
}

function persistOrders(orders) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders))
}

function formatCurrency(n) {
  return '$' + n.toLocaleString()
}

function PharmacyInstructions({ order, client, profile, onClose }) {
  const [comprobanteEnviado, setComprobanteEnviado] = useState(false)
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
                <div className="text-[10px] sm:text-xs text-emerald-200 mt-0.5">Coloca los productos en el compartimento del dron. Asegurate de que queden bien ajustados.</div>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-[10px] sm:text-sm">3</div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Coloca el dron en la plataforma</div>
                <div className="text-[10px] sm:text-xs text-emerald-200 mt-0.5">Ubica el dron en la plataforma de despegue designada. Verifica que el area este despejada.</div>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-[10px] sm:text-sm">4</div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Alejate para el despegue</div>
                <div className="text-[10px] sm:text-xs text-emerald-200 mt-0.5">Mantente a una distancia segura durante el despegue. El dron seguira su ruta automaticamente.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/10 text-left mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-bold text-white">Resumen de la orden</span>
            <span className="text-[10px] sm:text-xs text-emerald-300">{order.productos.reduce((s, i) => s + i.cantidad, 0)} producto{order.productos.reduce((s, i) => s + i.cantidad, 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-1 text-[10px] sm:text-xs">
            {order.productos.map((p, i) => (
              <div key={i} className="flex justify-between text-emerald-100 gap-2">
                <span className="text-left truncate">{p.nombre} x {p.cantidad}</span>
                <span className="font-semibold text-white flex-shrink-0">{formatCurrency(p.precio * p.cantidad)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-2 sm:mt-3 pt-2 sm:pt-3 flex justify-between text-xs sm:text-sm">
            <span className="font-bold text-white">Total</span>
            <span className="font-bold text-emerald-300">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {client && (
          <div className="text-[10px] sm:text-xs text-emerald-200 mb-1 sm:mb-2">
            Cliente: {client.nombre} &middot; {client.telefono}
          </div>
        )}
        {order.destino && (
          <div className="text-[10px] sm:text-xs text-emerald-200 mb-4 sm:mb-6">
            Destino: {order.destino.direccion}
          </div>
        )}

        <button
          onClick={() => { alert('Comprobante enviado al cliente exitosamente'); setComprobanteEnviado(true) }}
          className={`w-full ${comprobanteEnviado ? 'bg-emerald-500/30 text-emerald-300 cursor-default' : 'bg-white/20 hover:bg-white/30 text-white'} font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 active:scale-[0.97] text-sm sm:text-base mb-3`}
        >
          {comprobanteEnviado ? '✓ Comprobante enviado' : 'Enviar comprobante al cliente'}
        </button>

        <button
          onClick={onClose}
          className="bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 active:scale-[0.97] text-sm sm:text-base"
        >
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
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all duration-200 active:scale-[0.97]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-[0.97]"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrdersReceivedPage({ user }) {
  const farmaciaId = user?.farmaciaId || 'FARM-001'
  const [selected, setSelected] = useState(null)
  const [localOrders, setLocalOrders] = useState(() => loadMergedOrders())
  const [showInstructions, setShowInstructions] = useState(null)
  const [confirmReady, setConfirmReady] = useState(null)
  const [confirmPayment, setConfirmPayment] = useState(null)
  const [readOrders, setReadOrders] = useState(() => new Set())
  const [newOrderAlert, setNewOrderAlert] = useState(false)

  useEffect(() => {
    persistOrders(localOrders)
  }, [localOrders])

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const saved = localStorage.getItem(ORDER_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          const currentPendienteIds = new Set(localOrders.filter(o => o.estado === 'Pendiente').map(o => o.id))
          const hasNewPendiente = parsed.some(o => o.estado === 'Pendiente' && !currentPendienteIds.has(o.id))
          if (hasNewPendiente) {
            setNewOrderAlert(true)
          }
        }
      } catch { /* ignore */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [localOrders])

  const pharmacyOrders = useMemo(
    () => localOrders.filter((o) => o.farmaciaId === farmaciaId),
    [farmaciaId, localOrders]
  )

  const order = selected
    ? localOrders.find((o) => o.id === selected)
    : null

  const profile = order
    ? pharmacyProfiles.find((p) => p.id === order.farmaciaId)
    : null

  const client = order
    ? users.find((u) => u.id === order.clienteId)
    : null

  function markReady(id) {
    setLocalOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, estado: 'Preparado' } : o
      )
    )
    setConfirmReady(null)
    setShowInstructions(id)
  }

  function handleConfirmPayment(id) {
    setLocalOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, estado: 'Pagado' } : o
      )
    )
    setConfirmPayment(null)
    setSelected(id)
  }

  const sortedOrders = useMemo(
    () => [...pharmacyOrders].sort((a, b) => {
      const orderPriorities = { 'Preparando': -1, 'Pendiente': 0, 'Pagado': 1, 'Preparado': 2, 'En tránsito': 3, 'Entregado': 4 }
      return (orderPriorities[a.estado] ?? 9) - (orderPriorities[b.estado] ?? 9)
    }),
    [pharmacyOrders]
  )

  function handleSelectOrder(id) {
    setSelected(selected === id ? null : id)
    setReadOrders(prev => { const next = new Set(prev); next.add(id); return next })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Ordenes Recibidas</h2>
          <p className="text-sm text-gray-500 mt-1">
            {pharmacyOrders.length} orden{pharmacyOrders.length !== 1 ? 'es' : ''} recibida{pharmacyOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <span className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold rounded-full px-4 py-1.5 shadow-md">
          {pharmacyOrders.filter((o) => o.estado === 'Pendiente' || o.estado === 'Pagado' || o.estado === 'Preparado').length} activas
        </span>
      </div>

      {newOrderAlert && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 mb-6 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="font-semibold">¡Nuevo pedido recibido!</span>
          </div>
          <button
            onClick={() => { setNewOrderAlert(false); setLocalOrders(loadMergedOrders()) }}
            className="text-xs font-bold bg-amber-200 hover:bg-amber-300 text-amber-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            Ver
          </button>
        </div>
      )}

      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[1fr_1fr]">
        <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                  <th className="text-left pb-3 pr-4">Orden</th>
                  <th className="text-left pb-3 pr-4">Cliente</th>
                  <th className="text-left pb-3 pr-4">Items</th>
                  <th className="text-left pb-3 pr-4">Total</th>
                  <th className="text-left pb-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pharmacyOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-400 text-sm">
                      No hay ordenes recibidas
                    </td>
                  </tr>
                ) : (
                  sortedOrders.map((o, i) => {
                    const c = users.find((u) => u.id === o.clienteId)
                    return (
                      <tr
                        key={o.id}
                        onClick={() => handleSelectOrder(o.id)}
                        className={`border-b border-gray-50 transition-colors cursor-pointer animate-fade-in ${
                          selected === o.id ? 'bg-emerald-50' : ''
                        } ${
                          o.estado === 'Preparando' && !readOrders.has(o.id)
                            ? 'bg-gray-100 hover:bg-gray-200 font-semibold'
                            : 'hover:bg-emerald-50'
                        }`}
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <td className="py-3 pr-4 text-emerald-600 font-semibold whitespace-nowrap">{o.id}</td>
                        <td className="py-3 pr-4 text-gray-800 font-medium">{c?.nombre || 'Cliente'}</td>
                        <td className="py-3 pr-4 text-gray-600">{o.productos.length}</td>
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

        <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
          {order ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">{order.id}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{order.fecha}</p>
                </div>
                <Badge text={order.estado} />
              </div>

              {client && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md">
                      {client.nombre?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{client.nombre}</div>
                      <div className="text-xs text-gray-500">{client.telefono}</div>
                      {client.direccion && <div className="text-xs text-gray-400 mt-0.5">{client.direccion}</div>}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Referencia de pago</div>
                <div className="text-sm font-bold text-gray-800 font-mono">{order.referencia || '—'}</div>
              </div>

              <div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Productos</div>
                <div className="space-y-2">
                  {order.productos.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm flex-shrink-0 font-bold text-emerald-500">
                          Rx
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{p.nombre}</div>
                          <div className="text-xs text-gray-500">x{p.cantidad}</div>
                        </div>
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
                  <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">{formatCurrency(order.total)}</span>
                </div>
              </div>

              {order.destino && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Destino de entrega</div>
                  <div className="text-sm font-semibold text-gray-800">{order.destino.nombre}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{order.destino.direccion}</div>
                </div>
              )}

              {order.estado === 'Preparando' && (
                <div className="pt-2 space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold">Revisa el pago y los productos</p>
                      <p className="mt-1.5 font-mono font-bold text-base">Ref: {order.referencia || '—'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmReady(order.id)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl active:scale-[0.97]"
                  >
                    Listo para recolección
                  </button>
                </div>
              )}

              {order.estado === 'Pendiente' && (
                <div className="pt-2 space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div className="text-[11px] text-amber-800">
                      <p>El cliente ha enviado el comprobante de pago. Verifica que hayas recibido la transferencia para confirmar.</p>
                      <p className="mt-1.5 font-mono font-bold">Ref: {order.referencia || '—'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmPayment(order.id)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.97]"
                  >
                    Confirmar Pago Recibido
                  </button>
                </div>
              )}

              {(order.estado === 'Pagado' || order.estado === 'Preparado') && (
                <div className="pt-2">
                  {order.estado === 'Pagado' && (
                    <button
                      onClick={() => setConfirmReady(order.id)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl active:scale-[0.97]"
                    >
                      Preparado
                    </button>
                  )}
                  {order.estado === 'Preparado' && (
                    <div className="flex items-center justify-center text-amber-600 text-sm font-semibold bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
                      Pedido preparado, esperando operador
                    </div>
                  )}
                </div>
              )}

              {(order.estado === 'Entregado' || order.estado === 'En tránsito') && (
                <div className="pt-2">
                  <div className="text-gray-500 text-sm bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 text-center">
                    {order.estado === 'Entregado' ? 'Orden entregada al cliente' : 'Dron en camino al destino'}
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
        <ConfirmModal
          message="¿Confirmas que has recibido la transferencia del cliente?"
          onConfirm={() => handleConfirmPayment(confirmPayment)}
          onCancel={() => setConfirmPayment(null)}
        />
      )}

      {confirmReady && (
        <ConfirmModal
          message="¿Estas seguro de marcar esta orden como preparada?"
          onConfirm={() => markReady(confirmReady)}
          onCancel={() => setConfirmReady(null)}
        />
      )}

      {showInstructions && (() => {
        const ord = localOrders.find((o) => o.id === showInstructions)
        if (!ord) return null
        const cli = users.find((u) => u.id === ord.clienteId)
        const prof = pharmacyProfiles.find((p) => p.id === ord.farmaciaId)
        return (
          <PharmacyInstructions
            order={ord}
            client={cli}
            profile={prof}
            onClose={() => setShowInstructions(null)}
          />
        )
      })()}
    </div>
  )
}
