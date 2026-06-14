import { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const BOUNDS = L.latLngBounds(L.latLng(7.77, -72.40), L.latLng(7.87, -72.26))

const CENTER = { lat: 7.8247, lng: -72.3082 }

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

function DraggableMarker({ position, onMove }) {
  useMapEvents({
    click(e) {
      if (BOUNDS.contains(e.latlng)) onMove(e.latlng)
    },
  })

  return (
    <Marker
      position={position}
      draggable={true}
      icon={pinIcon}
      eventHandlers={{
        dragend(e) {
          const pos = e.target.getLatLng()
          if (BOUNDS.contains(pos)) onMove(pos)
        },
      }}
    />
  )
}

function MapController({ position }) {
  const map = useMap()

  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100)
    map.setMaxBounds(BOUNDS)
    map.flyTo(position, 17, { duration: 0.8 })
    map.on('drag', () => {
      if (!BOUNDS.contains(map.getCenter())) map.panInsideBounds(BOUNDS, { animate: true })
    })
  }, [map])

  useEffect(() => { map.flyTo(position, 17, { duration: 0.6 }) }, [position, map])

  return null
}

function ZoomControl() {
  const map = useMap()
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1">
      <button onClick={() => map.zoomIn()} className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 text-lg font-bold">+</button>
      <button onClick={() => map.zoomOut()} className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 text-lg font-bold">&minus;</button>
    </div>
  )
}

export default function LocationPicker({ onConfirm, onBack }) {
  const [position, setPosition] = useState(CENTER)
  const [address, setAddress] = useState('')
  const [resolving, setResolving] = useState(false)

  const reverseGeocode = useCallback(async (latlng) => {
    setResolving(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`)
      const data = await res.json()
      setAddress(data.display_name || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`)
    } catch { setAddress(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`) }
    setResolving(false)
  }, [])

  useEffect(() => { reverseGeocode(position) }, [])

  function handleMove(latlng) { setPosition(latlng); reverseGeocode(latlng) }
  function handleConfirm() {
    onConfirm({ ...position, address, nombre: address ? address.split(',')[0] : 'Capacho', direccion: address })
  }

  const shortAddr = address ? address.split(',').slice(0, 3).join(',') : ''

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-fade-in">
      <div className="flex-shrink-0 flex items-center justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button onClick={onBack} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 font-['Plus_Jakarta_Sans'] truncate">Entrega en Capacho</h3>
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">Arrastra el pin hasta tu direccion exacta</p>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-start gap-2">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Elige una <strong>zona de aterrizaje segura</strong> para el dron: libre de cables, árboles frondosos, techos inclinados o cualquier obstáculo que pueda interferir con el descenso.
        </p>
      </div>

      <div className="flex-1 relative z-0 bg-gray-200">
        <MapContainer center={position} zoom={17} className="w-full h-full" zoomControl={false} maxBounds={BOUNDS} maxBoundsViscosity={1} style={{ background: '#1a1a2e' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">ESRI</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
          />
          <DraggableMarker position={position} onMove={handleMove} />
          <MapController position={position} />
          <ZoomControl />
        </MapContainer>

        <div className="absolute bottom-3 sm:bottom-6 left-2 sm:left-4 right-2 sm:right-4 z-[1000]">
          <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-red-100">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                {resolving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-400">Obteniendo direccion...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-bold text-gray-900 truncate">{shortAddr || 'Capacho, Tachira'}</div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{address ? address.split(',').slice(3).join(',').trim() || 'Capacho' : 'Arrastra el pin rojo hasta tu ubicacion'}</div>
                  </>
                )}
              </div>
            </div>
            <button onClick={handleConfirm} disabled={resolving} className="w-full mt-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-xl active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
              Confirmar ubicacion
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
