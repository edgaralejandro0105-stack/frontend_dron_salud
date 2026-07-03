import { useState, useMemo, useEffect } from 'react'
import { getPedidos, getDrones, getDronesDisponibles, updateEstado, asignarDronOperador, liberarPedido } from '../../api'
import Badge from '../../components/ui/Badge'

function ConfirmModal({ message, onConfirm, onCancel, confirmText = 'Confirmar', confirmColor = 'from-rose-500 to-rose-600' }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-4 w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <p className="text-gray-800 text-sm font-semibold text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all">Volver</button>
          <button onClick={onConfirm} className={`flex-1 bg-gradient-to-r ${confirmColor} text-white font-bold py-3 rounded-xl shadow-lg`}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function mapEmbedUrl(originLat, originLng, destLat, destLng) {
  const q = encodeURIComponent(`${destLat},${destLng}`)
  return `https://maps.google.com/maps?q=${q}&z=15&output=embed`
}

function dirsUrl(originLat, originLng, destLat, destLng) {
  return `https://www.google.com/maps/dir/${originLat},${originLng}/${destLat},${destLng}`
}

function mapsUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`
}

export default function DispatchPage({ user }) {
  const [pedidos, setPedidos] = useState([])
  const [drones, setDrones] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [selectedDrone, setSelectedDrone] = useState('')
  const [launchedDrone, setLaunchedDrone] = useState(null)
  const [confirmCancel, setConfirmCancel] = useState(null)
  const [confirmFinish, setConfirmFinish] = useState(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [])

  function loadData() {
    Promise.all([
      getPedidos(),
      getDronesDisponibles(),
    ]).then(([p, d]) => {
      const list = Array.isArray(p) ? p : (p?.pedidos || [])
      setPedidos(list)
      if (Array.isArray(d)) setDrones(d)
      else if (d?.drones) setDrones(d.drones)
    }).catch(() => {})
  }

  const pendingOrders = useMemo(
    () => pedidos.filter(o => o.estado_pedido === 'Preparado' || o.estado_pedido === 'En transito'),
    [pedidos]
  )

  const order = selectedOrderId ? pedidos.find(o => o.id_pedido === selectedOrderId) : null
  const enVuelo = order?.estado_pedido === 'En transito' && order?.id_dron
  const profile = order?.farmacia || null

  function handleAccept(id) {
    setSelectedOrderId(id)
    setSelectedDrone('')
  }

  const handleLaunch = async () => {
    if (!selectedDrone || !order) return
    const dronId = Number(selectedDrone)
    try {
      await asignarDronOperador(order.id_pedido, {
        id_dron: dronId,
        id_operador: user?.id_operador || null,
      })
      setPedidos(prev => prev.map(o =>
        o.id_pedido === order.id_pedido
          ? { ...o, estado_pedido: 'En transito', id_dron: dronId }
          : o
      ))
      setDrones(prev => prev.filter(d => d.id_dron !== dronId))
      setLaunchedDrone(dronId)
    } catch (err) {
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Error al lanzar')
    }
  }

  async function handleLiberar(id) {
    try {
      await liberarPedido(id)
      setPedidos(prev => prev.map(o => o.id_pedido === id ? { ...o, estado_pedido: 'Preparado', id_dron: null, id_operador: null } : o))
      setConfirmCancel(null)
      setSelectedOrderId(null)
      setSelectedDrone('')
      setLaunchedDrone(null)
    } catch (err) {
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Error al liberar')
    }
  }

  async function handleFinish(id) {
    try {
      await updateEstado(id, 'Entregado')
      setPedidos(prev => prev.map(o => o.id_pedido === id ? { ...o, estado_pedido: 'Entregado' } : o))
      setConfirmFinish(null)
      setSelectedOrderId(null)
      setSelectedDrone('')
      setLaunchedDrone(null)
    } catch (err) {
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Error al finalizar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Pedidos Pendientes</h3>
          <span className="bg-gradient-to-r from-sky-600 to-blue-700 text-white text-xs font-bold rounded-full px-3 py-1 shadow-sm">{pendingOrders.length}</span>
        </div>
        {pendingOrders.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">No hay pedidos pendientes</div>
        ) : (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {pendingOrders.map(o => {
              const p = o.farmacia
              const isAccepted = selectedOrderId === o.id_pedido
              return (
                <div key={o.id_pedido} className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isAccepted ? 'border-blue-300 bg-gradient-to-br from-sky-50/80 to-blue-50/80 shadow-md' : 'border-gray-100 bg-white/80 hover:bg-blue-50/30 hover:border-blue-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-800">#{o.id_pedido}</span>
                    <Badge text={o.estado_pedido} />
                  </div>
                  <div className="text-xs text-gray-600 mb-1">{p?.nombre_comercial || `Farmacia #${o.id_farmacia}`}</div>
                  <div className="text-xs font-semibold text-gray-700">{o.cliente?.nombre} {o.cliente?.apellido || ''}</div>
                  <div className="text-xs text-gray-500">{(o.detalles || []).length} producto{(o.detalles || []).length !== 1 ? 's' : ''} · {formatCurrency(o.total)}</div>
                  {o.destino_nombre && <div className="text-xs text-blue-600 mt-1">{o.destino_nombre}</div>}
                  <button
                    onClick={() => { if (o.estado_pedido === 'Preparado') { handleAccept(o.id_pedido) } else { setSelectedOrderId(isAccepted ? null : o.id_pedido); setSelectedDrone('') } }}
                    className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.97] ${
                      o.estado_pedido === 'Preparado'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {o.estado_pedido === 'Preparado' ? 'Aceptar pedido' : 'Ver pedido'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {order && profile ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-5">
            <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Ruta de Entrega</h3>
                <a href={dirsUrl(profile.lat, profile.lng, order.latitud_entrega, order.longitud_entrega)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Ver ruta</a>
              </div>
              <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 text-xs">
                <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-[10px]">O</span>
                <span className="text-gray-600 truncate">{profile.nombre_comercial}</span>
                <span className="text-gray-300">-</span>
                <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">D</span>
                <span className="text-gray-600 truncate">{order.destino_nombre || 'Destino'}</span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-200 h-[200px] sm:h-[290px]">
                <iframe title="route-map" src={mapEmbedUrl(profile.lat, profile.lng, order.latitud_entrega, order.longitud_entrega)} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
              </div>
            </div>

            <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Ubicacion de la Farmacia</h3>
                <a href={mapsUrl(profile.lat, profile.lng)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Ver mapa</a>
              </div>
              <div className="flex items-center gap-3 mb-3 bg-green-50 rounded-xl px-4 py-2.5 border border-green-100 text-xs">
                <div className="w-7 h-7 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-sm">{profile.nombre_comercial?.charAt(0)}</div>
                <div>
                  <div className="font-bold text-gray-800">{profile.nombre_comercial}</div>
                  <div className="text-gray-500">{profile.direccion}</div>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-200 h-[200px] sm:h-[290px]">
                <iframe title="pharmacy-map" src={`https://maps.google.com/maps?q=${encodeURIComponent(profile.nombre_comercial + ', San Cristóbal, Táchira, Venezuela')}&z=16&output=embed`} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">{profile.nombre_comercial?.charAt(0)}</div>
                    <div>
                      <div className="text-xs font-bold text-gray-800">Origen</div>
                      <div className="text-[11px] text-gray-500">{profile.nombre_comercial}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-600 space-y-1">
                    <div className="flex items-center gap-1.5"><span className="text-gray-400">Dir</span><span className="truncate">{profile.direccion}</span></div>
                    <div className="flex items-center gap-1.5"><span className="text-gray-400">Tel</span><span>{profile.telefono}</span></div>
                  </div>
                  <a href={mapsUrl(profile.lat, profile.lng)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[11px] font-semibold text-blue-600 hover:text-blue-800">Ver en Google Maps</a>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">{order.destino_nombre?.charAt(0) || 'D'}</div>
                    <div>
                      <div className="text-xs font-bold text-gray-800">Destino</div>
                      <div className="text-[11px] text-gray-500">{order.destino_nombre || 'Destino'}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-600 space-y-1">
                    <div className="flex items-center gap-1.5"><span className="text-gray-400">Dir</span><span className="truncate">{order.destino_direccion}</span></div>
                  </div>
                  <a href={mapsUrl(order.latitud_entrega, order.longitud_entrega)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[11px] font-semibold text-blue-600 hover:text-blue-800">Ver en Google Maps</a>
                </div>
              </div>
            </div>

            <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">#{order.id_pedido}</h3>
                <Badge text={order.estado_pedido} />
              </div>
              <div className="space-y-1.5 mb-3">
                {(order.detalles || []).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                    <span>{p.nombre_producto} x {p.cantidad}</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(Number(p.precio_unitario) * p.cantidad)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div className="flex items-center justify-between text-xs text-gray-500"><span>Cargo dron</span><span>{formatCurrency(order.cargo_dron)}</span></div>
                <div className="flex items-center justify-between text-xs text-gray-500"><span>IVA 16%</span><span>{formatCurrency(order.iva)}</span></div>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3 mt-1">
                <span className="text-gray-700 font-semibold">Total</span>
                <span className="font-bold text-gray-800">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {order.cliente && (
              <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center text-sky-700 font-bold text-sm">
                    {order.cliente.nombre?.charAt(0) || 'C'}
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Datos del Cliente</h3>
                </div>
                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="font-semibold text-gray-800">{order.cliente.nombre} {order.cliente.apellido || ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                    <span>{order.cliente.cedula || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span>{order.cliente.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <span>{order.cliente.telefono || '—'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans'] mb-3">Seleccionar Dron</h3>
              {enVuelo && launchedDrone ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg animate-pulse">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-sky-800">Dron en vuelo</div>
                    <div className="text-xs text-sky-600">Disponible al finalizar el pedido</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-3">
                    {drones.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No hay drones disponibles</p>
                    ) : (
                      drones.map(d => (
                        <label key={d.id_dron} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${selectedDrone === String(d.id_dron) ? 'border-blue-300 bg-gradient-to-br from-sky-50/80 to-blue-50/80 shadow-sm' : 'border-gray-100 bg-white/80 hover:bg-blue-50/30 hover:border-blue-200'}`}>
                          <input type="radio" name="drone" value={d.id_dron} checked={selectedDrone === String(d.id_dron)} onChange={() => setSelectedDrone(String(d.id_dron))} className="accent-blue-600" />
                          <div className="flex-1">
                            <div className="text-sm font-bold text-gray-800">{d.matricula}</div>
                            <div className="text-xs text-gray-500">{d.modelo}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  <button onClick={handleLaunch} disabled={!selectedDrone} className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.97] ${selectedDrone ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                    {selectedDrone ? 'Despegar ' + drones.find(d => String(d.id_dron) === selectedDrone)?.matricula : 'Selecciona un dron'}
                  </button>
                </>
              )}
              {order.estado_pedido === 'En transito' && (
                <>
                  <button onClick={() => setConfirmFinish(order.id_pedido)} className="w-full mt-2 py-2.5 rounded-xl text-xs font-semibold text-emerald-600 hover:text-emerald-800 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-all active:scale-[0.97]">
                    Finalizar pedido
                  </button>
                  {!enVuelo && (
                    <button onClick={() => setConfirmCancel(order.id_pedido)} className="w-full mt-2 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-800 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-all active:scale-[0.97]">
                      Liberar pedido
                    </button>
                  )}
                  <p className="text-[10px] text-gray-400 text-center mt-1">{enVuelo ? 'El dron está en vuelo' : 'El dron y pedido volverán a estar disponibles'}</p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-12 text-center text-gray-400">
          <p className="text-sm font-semibold">Selecciona un pedido pendiente</p>
          <p className="text-xs mt-1">para ver los detalles y despachar un dron</p>
        </div>
      )}

      {confirmCancel && (
        <ConfirmModal message="¿Liberar este pedido? Volverá a estar disponible para otros operadores." onConfirm={() => handleLiberar(confirmCancel)} onCancel={() => setConfirmCancel(null)} confirmText="Liberar pedido" confirmColor="from-rose-500 to-rose-600" />
      )}
      {confirmFinish && (
        <ConfirmModal message="¿Confirmas que el pedido fue entregado? El dron volverá a estar disponible." onConfirm={() => handleFinish(confirmFinish)} onCancel={() => setConfirmFinish(null)} confirmText="Sí, entregado" confirmColor="from-emerald-500 to-emerald-600" />
      )}
    </div>
  )
}
