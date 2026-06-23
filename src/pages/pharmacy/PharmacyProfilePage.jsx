import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getFarmacia, updateMyFarmacia, uploadFile } from '../../api'

const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 focus:bg-white transition-all duration-200 text-sm'
const labelClass = 'text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block'

const pinIcon = new L.DivIcon({
  className: '',
  html: `<div style="position:relative;width:32px;height:44px;">
    <svg width="32" height="44" viewBox="0 0 32 44" fill="none" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.3));">
      <path d="M16 0C7.164 0 0 7.164 0 16c0 12 16 28 16 28s16-16 16-28C32 7.164 24.836 0 16 0z" fill="#10B981"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
      <circle cx="16" cy="16" r="3" fill="#10B981"/>
    </svg>
  </div>`,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
})

const defaultCenter = { lat: 7.8247, lng: -72.3082 }

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 150)
  }, [map])
  return null
}

function FitBounds({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, 16, { animate: true })
  }, [center, map])
  return null
}

export default function PharmacyProfilePage({ user }) {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [markerPos, setMarkerPos] = useState(null)
  const [uploading, setUploading] = useState({ logo: false, fachada: false })
  const resolvingRef = useRef(false)
  const farmaciaId = user?.id_farmacia

  useEffect(() => {
    if (!farmaciaId) return
    getFarmacia(farmaciaId).then(f => {
      setProfile(f)
      const lat = parseFloat(f.lat)
      const lng = parseFloat(f.lng)
      const pos = (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : null
      if (pos) setMarkerPos(pos)
      setForm({
        nombre_comercial: f.nombre_comercial || '',
        direccion: f.direccion || '',
        ciudad: f.ciudad || '',
        telefono: f.telefono || '',
        telefono_responsable: f.telefono_responsable || '',
        email: f.email || '',
        rif: f.rif || '',
        logo_url: f.logo_url || '',
        foto_fachada_url: f.foto_fachada_url || '',
        lat: lat || '',
        lng: lng || '',
      })
    }).catch(() => {})
  }, [farmaciaId])

  useEffect(() => {
    if (!markerPos || resolvingRef.current) return
    resolvingRef.current = true
    const lat = markerPos.lat.toFixed(5)
    const lng = markerPos.lng.toFixed(5)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
      .then(r => r.json())
      .then(data => {
        setForm(prev => ({ ...prev, direccion: data?.display_name || lat + ', ' + lng, lat, lng }))
      })
      .catch(() => setForm(prev => ({ ...prev, lat, lng })))
      .finally(() => { resolvingRef.current = false })
  }, [markerPos])

  async function handleFileUpload(type, file) {
    setUploading(prev => ({ ...prev, [type]: true }))
    try {
      const result = await uploadFile(file)
      setForm(prev => ({ ...prev, [type === 'logo' ? 'logo_url' : 'foto_fachada_url']: result.url }))
    } catch {
      setMsg('Error al subir la imagen')
      setTimeout(() => setMsg(null), 4000)
    }
    setUploading(prev => ({ ...prev, [type]: false }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!farmaciaId) return
    setSaving(true)
    try {
      await updateMyFarmacia({
        nombre_comercial: form.nombre_comercial,
        direccion: form.direccion,
        ciudad: form.ciudad,
        telefono: form.telefono,
        telefono_responsable: form.telefono_responsable,
        email: form.email,
        logo_url: form.logo_url,
        foto_fachada_url: form.foto_fachada_url,
      })
      setMsg('Perfil actualizado correctamente')
      getFarmacia(farmaciaId).then(f => setProfile(f))
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || 'Error al guardar'))
    }
    setSaving(false)
    setTimeout(() => setMsg(null), 4000)
  }

  if (!farmaciaId) return <div className="text-gray-400 text-center py-12">No hay farmacia asociada a esta cuenta</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {msg && (
        <div className={`rounded-2xl px-5 py-3.5 text-sm font-semibold text-center shadow-sm ${msg.startsWith('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Photos */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-8">
          <h3 className="text-sm font-bold text-gray-900 mb-6 font-['Plus_Jakarta_Sans']">Imágenes de la farmacia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Logo</label>
              <div className="relative flex items-center justify-center h-40 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden group">
                {form.logo_url ? (
                  <>
                    <img src={form.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" onError={e => { e.target.style.display = 'none' }} />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, logo_url: '' }))} className="w-7 h-7 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all">✕</button>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-300 text-xs">Sin logo</span>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-all cursor-pointer">
                  <span className="hidden group-hover:flex items-center gap-2 bg-white/90 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl shadow-lg">
                    {uploading.logo ? 'Subiendo...' : 'Subir logo'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" disabled={uploading.logo} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload('logo', f) }} />
                </label>
              </div>
            </div>
            <div>
              <label className={labelClass}>Foto de fachada</label>
              <div className="relative flex items-center justify-center h-40 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden group">
                {form.foto_fachada_url ? (
                  <>
                    <img src={form.foto_fachada_url} alt="Fachada" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, foto_fachada_url: '' }))} className="w-7 h-7 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all">✕</button>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-300 text-xs">Sin foto</span>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-all cursor-pointer">
                  <span className="hidden group-hover:flex items-center gap-2 bg-white/90 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl shadow-lg">
                    {uploading.fachada ? 'Subiendo...' : 'Subir foto'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" disabled={uploading.fachada} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload('fachada', f) }} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-8">
          <h3 className="text-sm font-bold text-gray-900 mb-2 font-['Plus_Jakarta_Sans']">Ubicación</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-amber-800">La ubicación solo puede ser modificada por el equipo de soporte. Si necesitas cambiar tu ubicación, contáctalos.</p>
          </div>
          <div className="h-[300px] rounded-2xl overflow-hidden border border-gray-200 mb-4 relative z-0">
            <MapContainer
              center={markerPos || defaultCenter}
              zoom={markerPos ? 16 : 14}
              className="h-full w-full"
              zoomControl={true}
              dragging={false}
              touchZoom={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              boxZoom={false}
              keyboard={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapResizer />
              {markerPos && <Marker position={markerPos} icon={pinIcon} interactive={false} />}
              <FitBounds center={markerPos} />
            </MapContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Dirección</label>
              <input value={form.direccion} className={inputClass + ' bg-gray-100 text-gray-500 cursor-not-allowed'} disabled />
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Solo soporte puede modificar la dirección
              </p>
            </div>
            <div>
              <label className={labelClass}>Ciudad</label>
              <input value={form.ciudad} className={inputClass + ' bg-gray-100 text-gray-500 cursor-not-allowed'} disabled />
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Solo soporte puede modificar la ciudad
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-8">
          <h3 className="text-sm font-bold text-gray-900 mb-6 font-['Plus_Jakarta_Sans']">Información general</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Nombre comercial</label>
              <input value={form.nombre_comercial} onChange={e => setForm({ ...form, nombre_comercial: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>RIF</label>
              <input value={form.rif} className={inputClass + ' bg-gray-100 text-gray-500 cursor-not-allowed'} disabled />
            </div>
            <div>
              <label className={labelClass}>Correo electrónico</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Teléfono del responsable</label>
              <input value={form.telefono_responsable} onChange={e => setForm({ ...form, telefono_responsable: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl active:scale-[0.98] disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
