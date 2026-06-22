import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getOperadores, createOperador, updateOperador, removeOperador, getFarmacias, createFarmacia, updateFarmacia, removeFarmacia, register, getUsuarios, removeUsuario } from '../../api'

const CENTER = { lat: 7.8247, lng: -72.3082 }
const TACHIRA_BOUNDS = L.latLngBounds(L.latLng(7.3, -72.6), L.latLng(8.5, -71.5))

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
    click(e) { onMove(e.latlng) },
  })
  return position ? <Marker position={position} icon={pinIcon} interactive={false} /> : null
}

function MapBoundsController() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100)
    map.setMaxBounds(TACHIRA_BOUNDS)
    map.on('drag', () => {
      if (!TACHIRA_BOUNDS.contains(map.getCenter())) {
        map.panInsideBounds(TACHIRA_BOUNDS, { animate: true })
      }
    })
  }, [map])
  return null
}

const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition-all duration-200 text-sm'
const labelClass = 'text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block'

export default function UserManagementPage() {
  const [tab, setTab] = useState('operador')
  const [msg, setMsg] = useState(null)
  const [lastCredentials, setLastCredentials] = useState(null)
  const [operadores, setOperadores] = useState([])
  const [farmacias, setFarmacias] = useState([])
  const resolvingRef = useRef(false)

  const [opForm, setOpForm] = useState({
    nombre: '', apellido: '', correo: '', cedula: '', licencia: '', horas_vuelo: '', telefono: '', vencimiento_licencia: ''
  })
  const [farmForm, setFarmForm] = useState({
    nombre_comercial: '', rif: '', direccion: '', correo: '', telefono: '', telefono_responsable: '', ciudad: ''
  })
  const [markerPos, setMarkerPos] = useState(null)

  const [editingOp, setEditingOp] = useState(null)
  const [editOpForm, setEditOpForm] = useState({})
  const [editingFarm, setEditingFarm] = useState(null)
  const [editFarmForm, setEditFarmForm] = useState({})
  const [editFarmMarkerPos, setEditFarmMarkerPos] = useState(null)
  const editFarmResolvingRef = useRef(false)

  const [confirmDelete, setConfirmDelete] = useState(null)
  const [admins, setAdmins] = useState([])

  const [adminForm, setAdminForm] = useState({
    nombre: '', apellido: '', cedula: '', email: '', password: '', telefono: ''
  })

  useEffect(() => {
    getOperadores().then(data => {
      if (Array.isArray(data)) setOperadores(data)
      else if (data?.operadores) setOperadores(data.operadores)
    }).catch(() => {})
    getFarmacias().then(data => {
      if (Array.isArray(data)) setFarmacias(data)
      else if (data?.farmacias) setFarmacias(data.farmacias)
    }).catch(() => {})
    getUsuarios('admin').then(data => {
      if (Array.isArray(data)) setAdmins(data)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!markerPos || resolvingRef.current) return
    resolvingRef.current = true
    const lat = markerPos.lat.toFixed(5)
    const lng = markerPos.lng.toFixed(5)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
      .then(r => r.json())
      .then(data => {
        const addr = data?.display_name || lat + ', ' + lng
        setFarmForm(prev => ({ ...prev, direccion: addr }))
      })
      .catch(() => setFarmForm(prev => ({ ...prev, direccion: lat + ', ' + lng })))
      .finally(() => { resolvingRef.current = false })
  }, [markerPos])

  useEffect(() => {
    if (!editFarmMarkerPos || editFarmResolvingRef.current) return
    editFarmResolvingRef.current = true
    const lat = editFarmMarkerPos.lat.toFixed(5)
    const lng = editFarmMarkerPos.lng.toFixed(5)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
      .then(r => r.json())
      .then(data => {
        const addr = data?.display_name || lat + ', ' + lng
        setEditFarmForm(prev => ({ ...prev, direccion: addr }))
      })
      .catch(() => setEditFarmForm(prev => ({ ...prev, direccion: lat + ', ' + lng })))
      .finally(() => { editFarmResolvingRef.current = false })
  }, [editFarmMarkerPos])

  async function handleOpSubmit(e) {
    e.preventDefault()
    if (!opForm.nombre || !opForm.correo || !opForm.cedula || !opForm.licencia) return
    try {
      const usuario = await register({
        nombre: opForm.nombre,
        apellido: opForm.apellido,
        cedula: opForm.cedula,
        email: opForm.correo,
        password: opForm.cedula + 'Drone',
        telefono: opForm.telefono,
        tipo_usuario: 'operador',
      })
      await createOperador({
        id_usuario: usuario.usuario?.id_usuario || usuario.id_usuario,
        cedula: opForm.cedula,
        nombre_operador: opForm.nombre,
        apellido: opForm.apellido,
        email: opForm.correo,
        nro_licencia: opForm.licencia,
        telefono: opForm.telefono,
        horas_vuelo: opForm.horas_vuelo ? Number(opForm.horas_vuelo) : 0,
      })
      setLastCredentials({ email: opForm.correo, password: opForm.cedula + 'Drone' })
      setMsg('Operador ' + opForm.nombre + ' ' + opForm.apellido + ' registrado correctamente')
      setOpForm({ nombre: '', apellido: '', correo: '', cedula: '', licencia: '', horas_vuelo: '', telefono: '', vencimiento_licencia: '' })
      getOperadores().then(data => {
        if (Array.isArray(data)) setOperadores(data)
        else if (data?.operadores) setOperadores(data.operadores)
      }).catch(() => {})
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || err?.response?.data?.error || 'Error al registrar'))
    }
    setTimeout(() => setMsg(null), 5000)
  }

  async function handleFarmSubmit(e) {
    e.preventDefault()
    if (!farmForm.nombre_comercial || !farmForm.rif || !farmForm.direccion) return
    try {
      const email = farmForm.correo || (farmForm.nombre_comercial.toLowerCase().replace(/\s+/g, '.') + '@farmacia.com')
      const farmacia = await createFarmacia({
        rif: farmForm.rif,
        nombre_comercial: farmForm.nombre_comercial,
        direccion: farmForm.direccion,
        ciudad: farmForm.ciudad || 'San Cristóbal',
        email,
        telefono: farmForm.telefono,
        telefono_responsable: farmForm.telefono_responsable,
        lat: markerPos ? String(markerPos.lat) : '',
        lng: markerPos ? String(markerPos.lng) : '',
      })
      await register({
        nombre: farmForm.nombre_comercial,
        cedula: farmForm.rif,
        email,
        password: farmForm.rif + 'Drone',
        telefono: farmForm.telefono,
        tipo_usuario: 'farmacia',
        id_farmacia: farmacia.id_farmacia,
      })
      setLastCredentials({ email, password: farmForm.rif + 'Drone' })
      setMsg('Farmacia ' + farmForm.nombre_comercial + ' registrada correctamente')
      setFarmForm({ nombre_comercial: '', rif: '', direccion: '', correo: '', telefono: '', telefono_responsable: '', ciudad: '' })
      setMarkerPos(null)
      getFarmacias().then(data => {
        if (Array.isArray(data)) setFarmacias(data)
        else if (data?.farmacias) setFarmacias(data.farmacias)
      }).catch(() => {})
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || err?.response?.data?.error || 'Error al registrar'))
    }
    setTimeout(() => setMsg(null), 5000)
  }

  async function toggleOpStatus(op) {
    try {
      await updateOperador(op.id_operador, { estado_disponibilidad: !op.estado_disponibilidad })
      setMsg(`Operador ${op.estado_disponibilidad ? 'deshabilitado' : 'habilitado'} correctamente`)
      getOperadores().then(data => setOperadores(Array.isArray(data) ? data : data?.operadores || [])).catch(() => {})
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || 'Error al cambiar estado'))
    }
    setTimeout(() => setMsg(null), 4000)
  }

  async function toggleFarmStatus(farm) {
    try {
      await updateFarmacia(farm.id_farmacia, { estado_operativo: !farm.estado_operativo })
      setMsg(`Farmacia ${farm.estado_operativo ? 'deshabilitada' : 'habilitada'} correctamente`)
      getFarmacias().then(data => setFarmacias(Array.isArray(data) ? data : data?.farmacias || [])).catch(() => {})
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || 'Error al cambiar estado'))
    }
    setTimeout(() => setMsg(null), 4000)
  }

  function startEditOp(op) {
    setEditOpForm({
      nombre_operador: op.nombre_operador,
      apellido: op.apellido || '',
      email: op.email || '',
      telefono: op.telefono || '',
      cedula: op.cedula || '',
      nro_licencia: op.nro_licencia || '',
      horas_vuelo: op.horas_vuelo || 0,
    })
    setEditingOp(op)
  }

  async function saveEditOp() {
    if (!editingOp) return
    try {
      await updateOperador(editingOp.id_operador, editOpForm)
      setMsg('Operador actualizado correctamente')
      setEditingOp(null)
      getOperadores().then(data => setOperadores(Array.isArray(data) ? data : data?.operadores || [])).catch(() => {})
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || 'Error al actualizar'))
    }
    setTimeout(() => setMsg(null), 4000)
  }

  function startEditFarm(farm) {
    setEditFarmForm({
      nombre_comercial: farm.nombre_comercial,
      rif: farm.rif || '',
      email: farm.email || '',
      telefono: farm.telefono || '',
      telefono_responsable: farm.telefono_responsable || '',
      ciudad: farm.ciudad || '',
      direccion: farm.direccion || '',
    })
    setEditFarmMarkerPos(farm.lat && farm.lng ? { lat: Number(farm.lat), lng: Number(farm.lng) } : null)
    setEditingFarm(farm)
  }

  async function saveEditFarm() {
    if (!editingFarm) return
    try {
      const payload = { ...editFarmForm }
      if (editFarmMarkerPos) {
        payload.lat = String(editFarmMarkerPos.lat)
        payload.lng = String(editFarmMarkerPos.lng)
      }
      await updateFarmacia(editingFarm.id_farmacia, payload)
      setMsg('Farmacia actualizada correctamente')
      setEditingFarm(null)
      setEditFarmMarkerPos(null)
      getFarmacias().then(data => setFarmacias(Array.isArray(data) ? data : data?.farmacias || [])).catch(() => {})
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || 'Error al actualizar'))
    }
    setTimeout(() => setMsg(null), 4000)
  }

  async function handleAdminSubmit(e) {
    e.preventDefault()
    if (!adminForm.nombre || !adminForm.email || !adminForm.password) return
    try {
      await register({
        nombre: adminForm.nombre,
        apellido: adminForm.apellido,
        cedula: adminForm.cedula,
        email: adminForm.email,
        password: adminForm.password,
        telefono: adminForm.telefono,
        tipo_usuario: 'admin',
      })
      setLastCredentials({ email: adminForm.email, password: adminForm.password })
      setMsg('Administrador registrado correctamente')
      setAdminForm({ nombre: '', apellido: '', cedula: '', email: '', password: '', telefono: '' })
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || err?.response?.data?.error || 'Error al registrar'))
    }
    setTimeout(() => setMsg(null), 5000)
  }

  function requestDelete(type, item) {
    setConfirmDelete({ type, item })
  }

  async function executeDelete() {
    if (!confirmDelete) return
    try {
      const { type, item } = confirmDelete
      if (type === 'operador') {
        await removeOperador(item.id_operador)
        setMsg('Operador eliminado correctamente')
      } else if (type === 'farmacia') {
        await removeFarmacia(item.id_farmacia)
        setMsg('Farmacia eliminada correctamente')
      } else {
        await removeUsuario(item.id_usuario)
        setMsg('Usuario eliminado correctamente')
      }
      setConfirmDelete(null)
      if (type === 'operador') {
        getOperadores().then(d => setOperadores(Array.isArray(d) ? d : d?.operadores || [])).catch(() => {})
      } else if (type === 'farmacia') {
        getFarmacias().then(d => setFarmacias(Array.isArray(d) ? d : d?.farmacias || [])).catch(() => {})
      } else {
        getUsuarios('admin').then(d => { if (Array.isArray(d)) setAdmins(d) }).catch(() => {})
      }
    } catch (err) {
      setMsg('Error: ' + (err?.response?.data?.message || 'Error al eliminar'))
    }
    setTimeout(() => setMsg(null), 4000)
  }

  return (
    <div className="max-w-5xl mx-auto">
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-2xl px-5 py-3.5 mb-6 text-center shadow-sm animate-fade-in">
          {msg}
        </div>
      )}

      {lastCredentials && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl px-5 py-4 mb-6 shadow-sm animate-scale-in">
          <div className="text-xs font-semibold uppercase tracking-widest mb-2">Credenciales generadas</div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-semibold w-14">Usuario:</span>
              <span className="font-mono font-bold">{lastCredentials.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-semibold w-14">Clave:</span>
              <span className="font-mono font-bold">{lastCredentials.password}</span>
            </div>
          </div>
          <button onClick={() => setLastCredentials(null)} className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-semibold">Cerrar</button>
        </div>
      )}

      <div className="flex gap-2 mb-8">
        <button onClick={() => setTab('operador')}
          className={`text-sm font-bold px-6 py-3 rounded-2xl transition-all duration-200 ${tab === 'operador' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 shadow-sm'}`}>
          Registrar Operador
        </button>
        <button onClick={() => setTab('farmacia')}
          className={`text-sm font-bold px-6 py-3 rounded-2xl transition-all duration-200 ${tab === 'farmacia' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 shadow-sm'}`}>
          Registrar Farmacia
        </button>
        <button onClick={() => setTab('admin')}
          className={`text-sm font-bold px-6 py-3 rounded-2xl transition-all duration-200 ${tab === 'admin' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 shadow-sm'}`}>
          Registrar Admin
        </button>
      </div>

      {tab === 'operador' ? (
        <>
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-8 mb-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20">O</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Registrar nuevo operador</h3>
                <p className="text-sm text-gray-400 mt-0.5">Complete los datos del operador de drones</p>
              </div>
            </div>
            <form onSubmit={handleOpSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input value={opForm.nombre} onChange={e => setOpForm({ ...opForm, nombre: e.target.value })} placeholder="Ej. Carlos" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Apellido</label>
                  <input value={opForm.apellido} onChange={e => setOpForm({ ...opForm, apellido: e.target.value })} placeholder="Ej. Gomez" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Correo electrónico</label>
                  <input type="email" value={opForm.correo} onChange={e => setOpForm({ ...opForm, correo: e.target.value })} placeholder="Ej. carlos@correo.com" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input value={opForm.telefono} onChange={e => setOpForm({ ...opForm, telefono: e.target.value })} placeholder="Ej. 0412-1234567" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Cedula</label>
                  <input value={opForm.cedula} onChange={e => setOpForm({ ...opForm, cedula: e.target.value })} placeholder="Ej. V-12345678" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Numero de licencia</label>
                  <input value={opForm.licencia} onChange={e => setOpForm({ ...opForm, licencia: e.target.value })} placeholder="Ej. LIC-2024-001" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Horas de vuelo acumuladas</label>
                  <input type="number" min="0" value={opForm.horas_vuelo} onChange={e => setOpForm({ ...opForm, horas_vuelo: e.target.value })} placeholder="Ej. 150" className={inputClass} />
                </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.98]">
                Registrar operador
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 font-['Plus_Jakarta_Sans']">Operadores registrados</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                    <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                    <th className="text-left pb-3 pr-4">Nombre</th>
                    <th className="text-left pb-3 pr-4">Email</th>
                    <th className="text-left pb-3 pr-4">Teléfono</th>
                    <th className="text-left pb-3 pr-4">Estado</th>
                    <th className="text-left pb-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {operadores.length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-gray-400 text-sm">No hay operadores registrados</td></tr>
                  ) : (
                    operadores.map((op, i) => (
                      <tr key={op.id_operador} className="border-b border-gray-50">
                        <td className="py-3 pr-4 font-semibold text-gray-800">{op.nombre_operador}{op.apellido ? ' ' + op.apellido : ''}</td>
                        <td className="py-3 pr-4 text-gray-600">{op.email}</td>
                        <td className="py-3 pr-4 text-gray-600">{op.telefono || '—'}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${op.estado_disponibilidad ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {op.estado_disponibilidad ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => startEditOp(op)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Editar">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => toggleOpStatus(op)} className={`p-1.5 rounded-lg transition-all ${op.estado_disponibilidad ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={op.estado_disponibilidad ? 'Deshabilitar' : 'Habilitar'}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={op.estado_disponibilidad ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'} /></svg>
                            </button>
                            <button onClick={() => requestDelete('operador', op)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Eliminar">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : tab === 'admin' ? (
        <>
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-purple-500/20">A</div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Registrar nuevo administrador</h3>
              <p className="text-sm text-gray-400 mt-0.5">Cree una cuenta con permisos de administrador</p>
            </div>
          </div>
          <form onSubmit={handleAdminSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Nombre</label>
                <input value={adminForm.nombre} onChange={e => setAdminForm({ ...adminForm, nombre: e.target.value })} placeholder="Ej. Luis" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Apellido</label>
                <input value={adminForm.apellido} onChange={e => setAdminForm({ ...adminForm, apellido: e.target.value })} placeholder="Ej. Perez" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Cédula</label>
                <input value={adminForm.cedula} onChange={e => setAdminForm({ ...adminForm, cedula: e.target.value })} placeholder="Ej. V-12345678" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input value={adminForm.telefono} onChange={e => setAdminForm({ ...adminForm, telefono: e.target.value })} placeholder="Ej. 0412-1234567" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Correo electrónico</label>
                <input type="email" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} placeholder="Ej. admin@dronsalud.com" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Contraseña</label>
                <input type="password" value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} placeholder="Min. 6 caracteres" className={inputClass} required />
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl active:scale-[0.98]">
              Registrar administrador
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 font-['Plus_Jakarta_Sans']">Administradores registrados</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                  <th className="text-left pb-3 pr-4">Nombre</th>
                  <th className="text-left pb-3 pr-4">Email</th>
                  <th className="text-left pb-3 pr-4">Teléfono</th>
                  <th className="text-left pb-3 pr-4">Estado</th>
                  <th className="text-left pb-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-gray-400 text-sm">No hay administradores registrados</td></tr>
                ) : (
                  admins.map(u => (
                    <tr key={u.id_usuario} className="border-b border-gray-50">
                      <td className="py-3 pr-4 font-semibold text-gray-800">{u.nombre} {u.apellido || ''}</td>
                      <td className="py-3 pr-4 text-gray-600">{u.email}</td>
                      <td className="py-3 pr-4 text-gray-600">{u.telefono || '—'}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.estado_cuenta === 'Activo' ? 'bg-emerald-50 text-emerald-600' : u.estado_cuenta === 'Suspendido' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                          {u.estado_cuenta}
                        </span>
                      </td>
                      <td className="py-3">
                        <button onClick={() => setConfirmDelete({ type: 'usuario', item: u })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Eliminar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
      ) : (
        <>
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-8 mb-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-500/20">F</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Registrar nueva farmacia</h3>
                <p className="text-sm text-gray-400 mt-0.5">Haga clic en el mapa para ubicar la farmacia</p>
              </div>
            </div>
            <form onSubmit={handleFarmSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input value={farmForm.nombre_comercial} onChange={e => setFarmForm({ ...farmForm, nombre_comercial: e.target.value })} placeholder="Ej. Farmatodo" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>RIF</label>
                  <input value={farmForm.rif} onChange={e => setFarmForm({ ...farmForm, rif: e.target.value })} placeholder="Ej. J-12345678-9" className={inputClass} required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Ubicacion</label>
                <div className="h-[280px] rounded-2xl overflow-hidden border border-gray-200 mb-3">
                  <MapContainer center={CENTER} zoom={14} className="h-full w-full" zoomControl={false} maxBounds={TACHIRA_BOUNDS} maxBoundsViscosity={1}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <ClickMarker position={markerPos} onMove={(pos) => setMarkerPos(pos)} />
                    <MapBoundsController />
                  </MapContainer>
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input value={farmForm.direccion} onChange={e => setFarmForm({ ...farmForm, direccion: e.target.value })} placeholder="Haga clic en el mapa para seleccionar la ubicacion" className={inputClass + ' pl-10'} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Ciudad</label>
                  <input value={farmForm.ciudad} onChange={e => setFarmForm({ ...farmForm, ciudad: e.target.value })} placeholder="San Cristóbal" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Correo electronico</label>
                  <input type="email" value={farmForm.correo} onChange={e => setFarmForm({ ...farmForm, correo: e.target.value })} placeholder="Ej. contacto@farmacia.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Numero de telefono</label>
                  <input value={farmForm.telefono} onChange={e => setFarmForm({ ...farmForm, telefono: e.target.value })} placeholder="Ej. 0276-3561234" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Telefono del responsable</label>
                  <input value={farmForm.telefono_responsable} onChange={e => setFarmForm({ ...farmForm, telefono_responsable: e.target.value })} placeholder="Ej. 0412-1234567" className={inputClass} />
                </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl active:scale-[0.98]">
                Registrar farmacia
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 font-['Plus_Jakarta_Sans']">Farmacias registradas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                    <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                    <th className="text-left pb-3 pr-4">Nombre</th>
                    <th className="text-left pb-3 pr-4">Email</th>
                    <th className="text-left pb-3 pr-4">Teléfono</th>
                    <th className="text-left pb-3 pr-4">Estado</th>
                    <th className="text-left pb-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {farmacias.length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-gray-400 text-sm">No hay farmacias registradas</td></tr>
                  ) : (
                    farmacias.map((p, i) => (
                      <tr key={p.id_farmacia} className="border-b border-gray-50">
                        <td className="py-3 pr-4 font-semibold text-gray-800">{p.nombre_comercial}</td>
                        <td className="py-3 pr-4 text-gray-600">{p.email || '—'}</td>
                        <td className="py-3 pr-4 text-gray-600">{p.telefono || '—'}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.estado_operativo ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {p.estado_operativo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => startEditFarm(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Editar">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => toggleFarmStatus(p)} className={`p-1.5 rounded-lg transition-all ${p.estado_operativo ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={p.estado_operativo ? 'Deshabilitar' : 'Habilitar'}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.estado_operativo ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'} /></svg>
                            </button>
                            <button onClick={() => requestDelete('farmacia', p)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Eliminar">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-2">¿Está seguro?</h3>
            <p className="text-sm text-gray-500 mb-1">
              {confirmDelete.type === 'operador'
                ? `Se eliminará al operador "${confirmDelete.item.nombre_operador} ${confirmDelete.item.apellido || ''}"`
                : confirmDelete.type === 'farmacia'
                ? `Se eliminará la farmacia "${confirmDelete.item.nombre_comercial}"`
                : `Se eliminará al usuario "${confirmDelete.item.nombre} ${confirmDelete.item.apellido || ''}"`
              }
            </p>
            <p className="text-xs text-gray-400 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={executeDelete} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold text-sm shadow-lg shadow-red-500/25 hover:shadow-xl active:scale-[0.98] transition-all">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit operator modal */}
      {editingOp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setEditingOp(null)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Editar operador</h3>
              <button onClick={() => setEditingOp(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Nombre</label><input value={editOpForm.nombre_operador} onChange={e => setEditOpForm({ ...editOpForm, nombre_operador: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Apellido</label><input value={editOpForm.apellido} onChange={e => setEditOpForm({ ...editOpForm, apellido: e.target.value })} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Email</label><input type="email" value={editOpForm.email} onChange={e => setEditOpForm({ ...editOpForm, email: e.target.value })} className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Teléfono</label><input value={editOpForm.telefono} onChange={e => setEditOpForm({ ...editOpForm, telefono: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Cédula</label><input value={editOpForm.cedula} onChange={e => setEditOpForm({ ...editOpForm, cedula: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Nro. licencia</label><input value={editOpForm.nro_licencia} onChange={e => setEditOpForm({ ...editOpForm, nro_licencia: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Horas de vuelo</label><input type="number" min="0" value={editOpForm.horas_vuelo} onChange={e => setEditOpForm({ ...editOpForm, horas_vuelo: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingOp(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">Cancelar</button>
                <button onClick={saveEditOp} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.98] transition-all">Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit farmacia modal */}
      {editingFarm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => { setEditingFarm(null); setEditFarmMarkerPos(null) }}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Editar farmacia</h3>
              <button onClick={() => { setEditingFarm(null); setEditFarmMarkerPos(null) }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Nombre</label><input value={editFarmForm.nombre_comercial} onChange={e => setEditFarmForm({ ...editFarmForm, nombre_comercial: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>RIF</label><input value={editFarmForm.rif} onChange={e => setEditFarmForm({ ...editFarmForm, rif: e.target.value })} className={inputClass} /></div>
              </div>
              <div>
                <label className={labelClass}>Ubicación</label>
                <div className="h-[200px] rounded-2xl overflow-hidden border border-gray-200 mb-3">
                  <MapContainer center={editFarmMarkerPos || CENTER} zoom={14} className="h-full w-full" zoomControl={false} maxBounds={TACHIRA_BOUNDS} maxBoundsViscosity={1}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <ClickMarker position={editFarmMarkerPos} onMove={(pos) => setEditFarmMarkerPos(pos)} />
                    <MapBoundsController />
                  </MapContainer>
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input value={editFarmForm.direccion} readOnly placeholder="Haga clic en el mapa para seleccionar la ubicacion" className={inputClass + ' pl-10'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Ciudad</label><input value={editFarmForm.ciudad} onChange={e => setEditFarmForm({ ...editFarmForm, ciudad: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Email</label><input type="email" value={editFarmForm.email} onChange={e => setEditFarmForm({ ...editFarmForm, email: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Teléfono</label><input value={editFarmForm.telefono} onChange={e => setEditFarmForm({ ...editFarmForm, telefono: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Tel. responsable</label><input value={editFarmForm.telefono_responsable} onChange={e => setEditFarmForm({ ...editFarmForm, telefono_responsable: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setEditingFarm(null); setEditFarmMarkerPos(null) }} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">Cancelar</button>
                <button onClick={saveEditFarm} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl active:scale-[0.98] transition-all">Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
