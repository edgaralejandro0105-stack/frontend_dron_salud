import { useState, useMemo } from 'react'
import { ordersData, pharmacyProfiles, fleetData } from '../../data/adminData'
import Badge from '../ui/Badge'

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
            Volver
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg active:scale-[0.97]"
          >
            Cancelar pedido
          </button>
        </div>
      </div>
    </div>
  )
}

function formatCurrency(n) {
  return '$' + n.toLocaleString()
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

export default function OperatorPanelView({ user }) {
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [selectedDrone, setSelectedDrone] = useState('')
  const [launched, setLaunched] = useState(false)
  const [localOrders, setLocalOrders] = useState(ordersData)
  const [confirmCancel, setConfirmCancel] = useState(null)

  const pendingOrders = useMemo(
    () => localOrders.filter(o => o.estado === 'Preparando' || o.estado === 'Preparado' || o.estado === 'En tránsito'),
    [localOrders]
  )

  const order = selectedOrderId
    ? localOrders.find(o => o.id === selectedOrderId)
    : null

  const profile = order
    ? pharmacyProfiles.find(p => p.id === order.farmaciaId)
    : null

  const availableDrones = useMemo(
    () => fleetData.filter(d => d.estado === 'Disponible' || d.estado === 'En vuelo'),
    []
  )

  function handleAccept(id) {
    setSelectedOrderId(id)
    setSelectedDrone('')
    setLaunched(false)
  }

  function handleCancel(id) {
    setLocalOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, operador: undefined, dron: '—' } : o
      )
    )
    setConfirmCancel(null)
    setSelectedOrderId(null)
    setSelectedDrone('')
    setLaunched(false)
  }

  const handleLaunch = () => {
    if (!selectedDrone) return
    setLaunched(true)
    const operadorNombre = user?.nombre || 'Operador'
    setLocalOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, estado: 'En tránsito', dron: selectedDrone, operador: operadorNombre } : o
      )
    )
    setTimeout(() => setLaunched(false), 5000)
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
              const p = pharmacyProfiles.find(ph => ph.id === o.farmaciaId)
              const isAccepted = selectedOrderId === o.id
              return (
                <div
                  key={o.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    isAccepted
                      ? 'border-blue-300 bg-gradient-to-br from-sky-50/80 to-blue-50/80 shadow-md'
                      : 'border-gray-100 bg-white/80 hover:bg-blue-50/30 hover:border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-800">{o.id}</span>
                    <Badge text={o.estado} />
                  </div>
                  <div className="text-xs text-gray-600 mb-1">{p?.nombre || o.farmacia}</div>
                  <div className="text-xs text-gray-500">{o.productos.length} producto{o.productos.length !== 1 ? 's' : ''} · {formatCurrency(o.total)}</div>
                  {o.destino && <div className="text-xs text-blue-600 mt-1">{o.destino.nombre}</div>}
                  <button
                    onClick={() => {
                      if (o.estado === 'Preparado') {
                        handleAccept(o.id)
                      } else {
                        setSelectedOrderId(isAccepted ? null : o.id)
                        setSelectedDrone('')
                        setLaunched(false)
                      }
                    }}
                    className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.97] ${
                      o.estado === 'Preparado'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md'
                        : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {o.estado === 'Preparado' ? 'Aceptar pedido' : 'Ver pedido'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {order && profile ? (
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_1.1fr]">
          <div className="space-y-5">
            <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Ruta de Entrega</h3>
                <a href={dirsUrl(profile.lat, profile.lng, order.destino.lat, order.destino.lng)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Ver ruta
                </a>
              </div>
              <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 text-xs">
                <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-[10px]">O</span>
                <span className="text-gray-600 truncate">{profile.nombre}</span>
                <span className="text-gray-300">-</span>
                <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">D</span>
                <span className="text-gray-600 truncate">{order.destino.nombre}</span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-200 h-[290px]">
                <iframe title="route-map" src={mapEmbedUrl(profile.lat, profile.lng, order.destino.lat, order.destino.lng)} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
              </div>
            </div>

            <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Ubicacion de la Farmacia</h3>
                <a href={mapsUrl(profile.lat, profile.lng)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                  Ver mapa
                </a>
              </div>
              <div className="flex items-center gap-3 mb-3 bg-green-50 rounded-xl px-4 py-2.5 border border-green-100 text-xs">
                <div className="w-7 h-7 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-sm">{profile.nombre.charAt(0)}</div>
                <div>
                  <div className="font-bold text-gray-800">{profile.nombre}</div>
                  <div className="text-gray-500">{profile.direccion}</div>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-200 h-[290px]">
                <iframe title="pharmacy-map" src={`https://maps.google.com/maps?q=${encodeURIComponent(profile.nombre + ', San Cristóbal, Táchira, Venezuela')}&z=16&output=embed`} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">{profile.nombre.charAt(0)}</div>
                    <div>
                      <div className="text-xs font-bold text-gray-800">Origen</div>
                      <div className="text-[11px] text-gray-500">{profile.nombre}</div>
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
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">{order.destino.nombre.charAt(0)}</div>
                    <div>
                      <div className="text-xs font-bold text-gray-800">Destino</div>
                      <div className="text-[11px] text-gray-500">{order.destino.nombre}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-600 space-y-1">
                    <div className="flex items-center gap-1.5"><span className="text-gray-400">Dir</span><span className="truncate">{order.destino.direccion}</span></div>
                  </div>
                  <a href={mapsUrl(order.destino.lat, order.destino.lng)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[11px] font-semibold text-blue-600 hover:text-blue-800">Ver en Google Maps</a>
                </div>
              </div>
            </div>

            <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">{order.id}</h3>
                <Badge text={order.estado} />
              </div>
              <div className="space-y-1.5 mb-3">
                {order.productos.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                    <span>{p.nombre} x {p.cantidad}</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(p.precio * p.cantidad)}</span>
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

            <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans'] mb-3">Seleccionar Dron</h3>
              <div className="grid gap-2 mb-3">
                {availableDrones.map(d => (
                  <label key={d.id} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${selectedDrone === d.id ? 'border-blue-300 bg-gradient-to-br from-sky-50/80 to-blue-50/80 shadow-sm' : 'border-gray-100 bg-white/80 hover:bg-blue-50/30 hover:border-blue-200'}`}>
                    <input type="radio" name="drone" value={d.id} checked={selectedDrone === d.id} onChange={() => setSelectedDrone(d.id)} className="accent-blue-600" />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-800">{d.id}</div>
                      <div className="text-xs text-gray-500">{d.ubicacion}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold ${d.bateria > 50 ? 'text-green-600' : d.bateria > 20 ? 'text-yellow-600' : 'text-red-600'}`}>{d.bateria}%</div>
                      <div className="w-14 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full rounded-full ${d.bateria > 50 ? 'bg-green-500' : d.bateria > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${d.bateria}%` }} />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <button onClick={handleLaunch} disabled={!selectedDrone} className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.97] ${launched ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : selectedDrone ? 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                {launched ? 'Dron despegando...' : selectedDrone ? 'Despegar ' + selectedDrone : 'Selecciona un dron'}
              </button>
              {order.estado === 'Preparado' && (
                <button
                  onClick={() => setConfirmCancel(order.id)}
                  className="w-full mt-2 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-700 border border-rose-200 hover:border-rose-300 bg-rose-50/50 hover:bg-rose-50 transition-all duration-200 active:scale-[0.97]"
                >
                  Cancelar pedido
                </button>
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
        <ConfirmModal
          message="¿Estas seguro de cancelar este pedido? Volvera a estar disponible para que otro operador lo acepte."
          onConfirm={() => handleCancel(confirmCancel)}
          onCancel={() => setConfirmCancel(null)}
        />
      )}
    </div>
  )
}

