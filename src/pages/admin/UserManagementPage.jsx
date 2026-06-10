import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const CENTER = { lat: 7.7690, lng: -72.2260 }

const pinIcon = new L.DivIcon({
  className: '',
  html: `<div style="position:relative;width:32px;height:44px;">
    <svg width="32" height="44" viewBox="0 0 32 44" fill="none" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.3));">
      <path d="M16 0C7.164 0 0 7.164 0 16c0 12 16 28 16 28s16-16 16-28C32 7.164 24.836 0 16 0z" fill="#EF4444"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
      <circle cx="16" cy="16" r="3" fill="#EF4444"/>
    </svg>
  </div>`,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
})

function ClickMarker({ position, onMove }) {
  useMapEvents({
    click(e) {
      onMove(e.latlng)
    },
  })
  return position ? <Marker position={position} icon={pinIcon} interactive={false} /> : null
}

const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition-all duration-200 text-sm'
const labelClass = 'text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block'

export default function UserManagementPage() {
  const [tab, setTab] = useState('operador')
  const [msg, setMsg] = useState(null)
  const resolvingRef = useRef(false)

  const [opForm, setOpForm] = useState({
    nombre: '', cedula: '', licencia: '', horas_vuelo: '', vencimiento_licencia: ''
  })
  const [farmForm, setFarmForm] = useState({
    nombre: '', rif: '', direccion: '', correo: '', telefono: ''
  })
  const [markerPos, setMarkerPos] = useState(null)

  useEffect(() => {
    if (!markerPos || resolvingRef.current) return
    resolvingRef.current = true
    const lat = markerPos.lat.toFixed(5)
    const lng = markerPos.lng.toFixed(5)
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    )
      .then((r) => r.json())
      .then((data) => {
        const addr = data?.display_name || lat + ', ' + lng
        setFarmForm((prev) => ({ ...prev, direccion: addr }))
      })
      .catch(() => {
        setFarmForm((prev) => ({ ...prev, direccion: lat + ', ' + lng }))
      })
      .finally(() => {
        resolvingRef.current = false
      })
  }, [markerPos])

  function showMsg(text) {
    setMsg(text)
    setTimeout(() => setMsg(null), 3500)
  }

  function handleOpSubmit(e) {
    e.preventDefault()
    if (!opForm.nombre || !opForm.cedula || !opForm.licencia) return
    showMsg('Operador ' + opForm.nombre + ' registrado correctamente')
    setOpForm({ nombre: '', cedula: '', licencia: '', horas_vuelo: '', vencimiento_licencia: '' })
  }

  function handleFarmSubmit(e) {
    e.preventDefault()
    if (!farmForm.nombre || !farmForm.rif || !farmForm.direccion) return
    showMsg('Farmacia ' + farmForm.nombre + ' registrada correctamente')
    setFarmForm({ nombre: '', rif: '', direccion: '', correo: '', telefono: '' })
    setMarkerPos(null)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-2xl px-5 py-3.5 mb-6 text-center shadow-sm animate-fade-in">
          {msg}
        </div>
      )}

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setTab('operador')}
          className={`text-sm font-bold px-6 py-3 rounded-2xl transition-all duration-200 ${
            tab === 'operador'
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 shadow-sm'
          }`}
        >
          Registrar Operador
        </button>
        <button
          onClick={() => setTab('farmacia')}
          className={`text-sm font-bold px-6 py-3 rounded-2xl transition-all duration-200 ${
            tab === 'farmacia'
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 shadow-sm'
          }`}
        >
          Registrar Farmacia
        </button>
      </div>

      {tab === 'operador' ? (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20">
              O
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Registrar nuevo operador</h3>
              <p className="text-sm text-gray-400 mt-0.5">Complete los datos del operador de drones</p>
            </div>
          </div>

          <form onSubmit={handleOpSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Nombre completo</label>
                <input
                  value={opForm.nombre}
                  onChange={(e) => setOpForm({ ...opForm, nombre: e.target.value })}
                  placeholder="Ej. Carlos Gomez"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Cedula</label>
                <input
                  value={opForm.cedula}
                  onChange={(e) => setOpForm({ ...opForm, cedula: e.target.value })}
                  placeholder="Ej. V-12345678"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Numero de licencia</label>
                <input
                  value={opForm.licencia}
                  onChange={(e) => setOpForm({ ...opForm, licencia: e.target.value })}
                  placeholder="Ej. LIC-2024-001"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Horas de vuelo acumuladas</label>
                <input
                  type="number"
                  min="0"
                  value={opForm.horas_vuelo}
                  onChange={(e) => setOpForm({ ...opForm, horas_vuelo: e.target.value })}
                  placeholder="Ej. 150"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Fecha de vencimiento de la licencia</label>
              <input
                type="date"
                value={opForm.vencimiento_licencia}
                onChange={(e) => setOpForm({ ...opForm, vencimiento_licencia: e.target.value })}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              Registrar operador
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-500/20">
              F
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Registrar nueva farmacia</h3>
              <p className="text-sm text-gray-400 mt-0.5">Haga clic en el mapa para ubicar la farmacia</p>
            </div>
          </div>

          <form onSubmit={handleFarmSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Nombre</label>
                <input
                  value={farmForm.nombre}
                  onChange={(e) => setFarmForm({ ...farmForm, nombre: e.target.value })}
                  placeholder="Ej. Farmatodo"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>RIF</label>
                <input
                  value={farmForm.rif}
                  onChange={(e) => setFarmForm({ ...farmForm, rif: e.target.value })}
                  placeholder="Ej. J-12345678-9"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Ubicacion</label>
              <div className="h-[280px] rounded-2xl overflow-hidden border border-gray-200 mb-3">
                <MapContainer
                  center={CENTER}
                  zoom={14}
                  className="h-full w-full"
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ClickMarker position={markerPos} onMove={(pos) => setMarkerPos(pos)} />
                </MapContainer>
              </div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  value={farmForm.direccion}
                  onChange={(e) => setFarmForm({ ...farmForm, direccion: e.target.value })}
                  placeholder="Haga clic en el mapa para seleccionar la ubicacion"
                  className={inputClass + ' pl-10'}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Correo electronico</label>
                <input
                  type="email"
                  value={farmForm.correo}
                  onChange={(e) => setFarmForm({ ...farmForm, correo: e.target.value })}
                  placeholder="Ej. contacto@farmacia.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Numero de telefono</label>
                <input
                  value={farmForm.telefono}
                  onChange={(e) => setFarmForm({ ...farmForm, telefono: e.target.value })}
                  placeholder="Ej. 0276-3561234"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]"
            >
              Registrar farmacia
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
