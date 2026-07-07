import { useState, useRef, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getOperadores, createOperador, updateOperador, removeOperador, getFarmacias, createFarmacia, updateFarmacia, removeFarmacia, register, getUsuarios, updateUsuario, updateUsuarioEstado, removeUsuario, getSuspensionesByUsuario } from '../../api'
import Avatar from '../../components/ui/Avatar'

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
    setTimeout(() => map.invalidateSize(), 200)
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
const PAGE_SIZE = 10

export default function UserManagementPage() {
  const [tab, setTab] = useState('operador')
  const [msg, setMsg] = useState(null)
  const [lastCredentials, setLastCredentials] = useState(null)
  const resolvingRef = useRef(false)

  const [operadores, setOperadores] = useState([])
  const [pageOp, setPageOp] = useState(1)
  const [totalOp, setTotalOp] = useState(0)
  const [totalPagesOp, setTotalPagesOp] = useState(1)
  const [searchOp, setSearchOp] = useState('')
  const [searchInputOp, setSearchInputOp] = useState('')
  const [showOpForm, setShowOpForm] = useState(false)

  const [farmacias, setFarmacias] = useState([])
  const [pageFarm, setPageFarm] = useState(1)
  const [totalFarm, setTotalFarm] = useState(0)
  const [totalPagesFarm, setTotalPagesFarm] = useState(1)
  const [searchFarm, setSearchFarm] = useState('')
  const [searchInputFarm, setSearchInputFarm] = useState('')
  const [showFarmForm, setShowFarmForm] = useState(false)

  const [admins, setAdmins] = useState([])
  const [pageAdmin, setPageAdmin] = useState(1)
  const [totalAdmin, setTotalAdmin] = useState(0)
  const [totalPagesAdmin, setTotalPagesAdmin] = useState(1)
  const [searchAdmin, setSearchAdmin] = useState('')
  const [searchInputAdmin, setSearchInputAdmin] = useState('')
  const [showAdminForm, setShowAdminForm] = useState(false)

  const [opForm, setOpForm] = useState({
    nombre: '', apellido: '', correo: '', cedula: '', licencia: '', horas_vuelo: '', telefono: '', vencimiento_licencia: '', foto_url: ''
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

  const [adminForm, setAdminForm] = useState({
    nombre: '', apellido: '', cedula: '', email: '', password: '', telefono: ''
  })
  const [opSuspendModal, setOpSuspendModal] = useState(null)
  const [opSuspendReason, setOpSuspendReason] = useState('')
  const [opSuspensionInfo, setOpSuspensionInfo] = useState(null)
  const [suspendAdminModal, setSuspendAdminModal] = useState(null)
  const [suspendAdminReason, setSuspendAdminReason] = useState('')
  const [adminSuspensionInfo, setAdminSuspensionInfo] = useState(null)
  const [farmSuspendModal, setFarmSuspendModal] = useState(null)
  const [farmSuspendReason, setFarmSuspendReason] = useState('')
  const [farmUsuariosMap, setFarmUsuariosMap] = useState({})
  const [expandedPhoto, setExpandedPhoto] = useState(null)

  const loadOperadores = useCallback((p = 1, s = '') => {
    getOperadores({ search: s || undefined, page: p, limit: PAGE_SIZE }).then(data => {
      setOperadores(data.data || [])
      setTotalOp(data.total || 0)
      setTotalPagesOp(data.totalPages || 1)
      setPageOp(data.page || 1)
    }).catch(() => {})
  }, [])

  const loadFarmacias = useCallback((p = 1, s = '') => {
    getFarmacias({ search: s || undefined, page: p, limit: PAGE_SIZE }).then(data => {
      setFarmacias(data.data || [])
      setTotalFarm(data.total || 0)
      setTotalPagesFarm(data.totalPages || 1)
      setPageFarm(data.page || 1)
    }).catch(() => {})
  }, [])

  const loadAdmins = useCallback((p = 1, s = '') => {
    getUsuarios({ tipo: 'admin', search: s || undefined, page: p, limit: PAGE_SIZE }).then(data => {
      setAdmins(data.data || [])
      setTotalAdmin(data.total || 0)
      setTotalPagesAdmin(data.totalPages || 1)
      setPageAdmin(data.page || 1)
    }).catch(() => {})
  }, [])

  const loadFarmUsuarios = useCallback(() => {
    getUsuarios({ tipo: 'farmacia', limit: 1000 }).then(data => {
      const arr = data.data || data || []
      const map = {}
      arr.forEach(u => { if (u.id_farmacia) map[u.id_farmacia] = u })
      setFarmUsuariosMap(map)
    }).catch(() => {})
  }, [])

  useEffect(() => { loadOperadores(1, searchOp) }, [searchOp, loadOperadores])
  useEffect(() => { loadOperadores() }, [loadOperadores])
  useEffect(() => { loadFarmacias(1, searchFarm) }, [searchFarm, loadFarmacias])
  useEffect(() => { loadFarmacias() }, [loadFarmacias])
  useEffect(() => { loadAdmins(1, searchAdmin) }, [searchAdmin, loadAdmins])
  useEffect(() => { loadAdmins() }, [loadAdmins])
  useEffect(() => { loadFarmUsuarios() }, [loadFarmUsuarios])

  useEffect(() => { const timer = setTimeout(() => setSearchOp(searchInputOp), 400); return () => clearTimeout(timer) }, [searchInputOp])
  useEffect(() => { const timer = setTimeout(() => setSearchFarm(searchInputFarm), 400); return () => clearTimeout(timer) }, [searchInputFarm])
  useEffect(() => { const timer = setTimeout(() => setSearchAdmin(searchInputAdmin), 400); return () => clearTimeout(timer) }, [searchInputAdmin])

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

  function showMsg(text) {
    setMsg(text)
    setTimeout(() => setMsg(null), 5000)
  }

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
      showMsg('Operador ' + opForm.nombre + ' ' + opForm.apellido + ' registrado correctamente')
      setOpForm({ nombre: '', apellido: '', correo: '', cedula: '', licencia: '', horas_vuelo: '', telefono: '', vencimiento_licencia: '' })
      loadOperadores()
    } catch (err) {
      showMsg('Error: ' + (err?.response?.data?.message || err?.response?.data?.error || 'Error al registrar'))
    }
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
      showMsg('Farmacia ' + farmForm.nombre_comercial + ' registrada correctamente')
      setFarmForm({ nombre_comercial: '', rif: '', direccion: '', correo: '', telefono: '', telefono_responsable: '', ciudad: '' })
      setMarkerPos(null)
      loadFarmacias()
      loadFarmUsuarios()
    } catch (err) {
      showMsg('Error: ' + (err?.response?.data?.message || err?.response?.data?.error || 'Error al registrar'))
    }
  }

  async function toggleOpStatus(op) {
    try {
      await updateOperador(op.id_operador, { estado_disponibilidad: !op.estado_disponibilidad })
      showMsg(`Operador ${op.estado_disponibilidad ? 'deshabilitado' : 'habilitado'} correctamente`)
      loadOperadores()
    } catch (err) { showMsg('Error: ' + (err?.response?.data?.message || 'Error al cambiar estado')) }
  }

  async function toggleFarmStatus(farm) {
    try {
      await updateFarmacia(farm.id_farmacia, { estado_operativo: !farm.estado_operativo })
      showMsg(`Farmacia ${farm.estado_operativo ? 'deshabilitada' : 'habilitada'} correctamente`)
      loadFarmacias()
    } catch (err) { showMsg('Error: ' + (err?.response?.data?.message || 'Error al cambiar estado')) }
  }

  function toggleFarmAccountStatus(farm) {
    const u = farmUsuariosMap[farm.id_farmacia]
    if (!u) { showMsg('Esta farmacia no tiene usuario asociado'); return }
    if (u.estado_cuenta === 'Suspendido') {
      updateUsuarioEstado(u.id_usuario, 'Activo').then(() => {
        showMsg('Farmacia activada correctamente')
        loadFarmUsuarios()
      }).catch(err => showMsg('Error: ' + (err?.response?.data?.message || 'Error al activar')))
      return
    }
    setFarmSuspendModal({ ...farm, usuario: u })
    setFarmSuspendReason('')
  }

  async function confirmSuspendFarm() {
    if (!farmSuspendModal || !farmSuspendReason.trim()) return
    try {
      await updateUsuarioEstado(farmSuspendModal.usuario.id_usuario, 'Suspendido', farmSuspendReason.trim())
      showMsg('Farmacia suspendida correctamente')
      setFarmSuspendModal(null); setFarmSuspendReason('')
      loadFarmUsuarios()
    } catch (err) { showMsg('Error: ' + (err?.response?.data?.message || 'Error al suspender')) }
  }

  async function handleViewFarmSuspension(farm) {
    const u = farmUsuariosMap[farm.id_farmacia]
    if (!u) { showMsg('No tiene usuario asociado'); return }
    try { const data = await getSuspensionesByUsuario(u.id_usuario); setOpSuspensionInfo(data) }
    catch { showMsg('Error al cargar suspensiones') }
  }

  function toggleOpAccountStatus(op) {
    if (op.usuario?.estado_cuenta === 'Activo' || !op.usuario?.estado_cuenta) { setOpSuspendModal(op); setOpSuspendReason(''); return }
    updateUsuarioEstado(op.id_usuario, 'Activo').then(() => {
      showMsg('Operador activado correctamente')
      loadOperadores()
    }).catch(err => showMsg('Error: ' + (err?.response?.data?.message || 'Error al activar')))
  }

  async function confirmSuspendOp() {
    if (!opSuspendModal || !opSuspendReason.trim()) return
    try {
      await updateUsuarioEstado(opSuspendModal.id_usuario, 'Suspendido', opSuspendReason.trim())
      showMsg('Operador suspendido correctamente')
      setOpSuspendModal(null); setOpSuspendReason('')
      loadOperadores()
    } catch (err) { showMsg('Error: ' + (err?.response?.data?.message || 'Error al suspender')) }
  }

  function toggleAdminStatus(u) {
    if (u.estado_cuenta === 'Activo' || !u.estado_cuenta) { setSuspendAdminModal(u); setSuspendAdminReason(''); return }
    updateUsuarioEstado(u.id_usuario, 'Activo').then(() => {
      showMsg('Admin activado correctamente')
      loadAdmins()
    }).catch(err => showMsg('Error: ' + (err?.response?.data?.message || 'Error al activar')))
  }

  async function confirmSuspendAdmin() {
    if (!suspendAdminModal || !suspendAdminReason.trim()) return
    try {
      await updateUsuarioEstado(suspendAdminModal.id_usuario, 'Suspendido', suspendAdminReason.trim())
      showMsg('Admin suspendido correctamente')
      setSuspendAdminModal(null); setSuspendAdminReason('')
      loadAdmins()
    } catch (err) { showMsg('Error: ' + (err?.response?.data?.message || 'Error al suspender')) }
  }

  async function handleViewOpSuspension(op) {
    try { const data = await getSuspensionesByUsuario(op.id_usuario); setOpSuspensionInfo(data) }
    catch { showMsg('Error al cargar suspensiones') }
  }

  async function handleViewAdminSuspension(u) {
    try { const data = await getSuspensionesByUsuario(u.id_usuario); setAdminSuspensionInfo(data) }
    catch { showMsg('Error al cargar suspensiones') }
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
      showMsg('Operador actualizado correctamente')
      setEditingOp(null)
      loadOperadores()
    } catch (err) { showMsg('Error: ' + (err?.response?.data?.message || 'Error al actualizar')) }
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
      showMsg('Farmacia actualizada correctamente')
      setEditingFarm(null)
      setEditFarmMarkerPos(null)
      loadFarmacias()
    } catch (err) { showMsg('Error: ' + (err?.response?.data?.message || 'Error al actualizar')) }
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
      showMsg('Administrador registrado correctamente')
      setAdminForm({ nombre: '', apellido: '', cedula: '', email: '', password: '', telefono: '' })
      loadAdmins()
    } catch (err) {
      showMsg('Error: ' + (err?.response?.data?.message || err?.response?.data?.error || 'Error al registrar'))
    }
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
        showMsg('Operador eliminado correctamente')
        loadOperadores()
      } else if (type === 'farmacia') {
        await removeFarmacia(item.id_farmacia)
        showMsg('Farmacia eliminada correctamente')
        loadFarmacias()
        loadFarmUsuarios()
      } else {
        await removeUsuario(item.id_usuario)
        showMsg('Usuario eliminado correctamente')
        loadAdmins()
      }
      setConfirmDelete(null)
    } catch (err) { showMsg('Error: ' + (err?.response?.data?.message || 'Error al eliminar')) }
  }

  function Pagination({ page, totalPages, total, onPageChange }) {
    if (totalPages <= 1) return null
    return (
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">Mostrando página {page} de {totalPages} ({total} resultados)</p>
        <div className="flex items-center gap-1">
          <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Anterior</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => onPageChange(p)} className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${p === page ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
          ))}
          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Siguiente</button>
        </div>
      </div>
    )
  }

  function SearchBar({ value, onChange, placeholder }) {
    return (
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition-all w-56" />
      </div>
    )
  }

  function CollapsibleForm({ show, onToggle, icon, iconBg, title, subtitle, children }) {
    return (
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-6 mb-6">
        <button onClick={onToggle} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center text-white text-lg font-bold shadow-lg`}>{icon}</div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">{title}</h3>
              <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${show ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {show && <div className="mt-6 pt-6 border-t border-gray-100">{children}</div>}
      </div>
    )
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
        <button onClick={() => setTab('operador')} className={`text-sm font-bold px-6 py-3 rounded-2xl transition-all duration-200 ${tab === 'operador' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 shadow-sm'}`}>Registrar Operador</button>
        <button onClick={() => setTab('farmacia')} className={`text-sm font-bold px-6 py-3 rounded-2xl transition-all duration-200 ${tab === 'farmacia' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 shadow-sm'}`}>Registrar Farmacia</button>
        <button onClick={() => setTab('admin')} className={`text-sm font-bold px-6 py-3 rounded-2xl transition-all duration-200 ${tab === 'admin' ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 shadow-sm'}`}>Registrar Admin</button>
      </div>

      {tab === 'operador' ? (
        <>
          <CollapsibleForm show={showOpForm} onToggle={() => setShowOpForm(!showOpForm)} icon="O" iconBg="bg-gradient-to-br from-sky-500 to-blue-600" title="Registrar nuevo operador" subtitle="Complete los datos del operador de drones">
            <form onSubmit={handleOpSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className={labelClass}>Nombre</label><input value={opForm.nombre} onChange={e => setOpForm({ ...opForm, nombre: e.target.value })} placeholder="Ej. Carlos" className={inputClass} required /></div>
                <div><label className={labelClass}>Apellido</label><input value={opForm.apellido} onChange={e => setOpForm({ ...opForm, apellido: e.target.value })} placeholder="Ej. Gomez" className={inputClass} /></div>
                <div><label className={labelClass}>Correo electrónico</label><input type="email" value={opForm.correo} onChange={e => setOpForm({ ...opForm, correo: e.target.value })} placeholder="Ej. carlos@correo.com" className={inputClass} required /></div>
                <div><label className={labelClass}>Teléfono</label><input value={opForm.telefono} onChange={e => setOpForm({ ...opForm, telefono: e.target.value })} placeholder="Ej. 0412-1234567" className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className={labelClass}>Cedula</label><input value={opForm.cedula} onChange={e => setOpForm({ ...opForm, cedula: e.target.value })} placeholder="Ej. V-12345678" className={inputClass} required /></div>
                <div><label className={labelClass}>Numero de licencia</label><input value={opForm.licencia} onChange={e => setOpForm({ ...opForm, licencia: e.target.value })} placeholder="Ej. LIC-2024-001" className={inputClass} required /></div>
                <div><label className={labelClass}>Horas de vuelo acumuladas</label><input type="number" min="0" value={opForm.horas_vuelo} onChange={e => setOpForm({ ...opForm, horas_vuelo: e.target.value })} placeholder="Ej. 150" className={inputClass} /></div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.98]">Registrar operador</button>
            </form>
          </CollapsibleForm>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Operadores registrados ({totalOp})</h3>
              <SearchBar value={searchInputOp} onChange={setSearchInputOp} placeholder="Buscar operador..." />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                    <th className="text-left pb-3 pr-4 w-10"></th>
                    <th className="text-left pb-3 pr-4">Nombre</th>
                    <th className="text-left pb-3 pr-4">Email</th>
                    <th className="text-left pb-3 pr-4">Teléfono</th>
                    <th className="text-left pb-3 pr-4">Estado</th>
                    <th className="text-left pb-3 pr-4">Cuenta</th>
                    <th className="text-left pb-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {operadores.length === 0 ? (
                    <tr><td colSpan="7" className="py-8 text-center text-gray-400 text-sm">No hay operadores registrados</td></tr>
                  ) : (
                    operadores.map((op) => (
                      <tr key={op.id_operador} className="border-b border-gray-50">
                        <td className="py-3 pr-4">
                          <Avatar src={op.foto_url || op.usuario?.foto_url} name={op.nombre_operador} size="sm" />
                        </td>
                        <td className="py-3 pr-4 font-semibold text-gray-800">{op.nombre_operador}{op.apellido ? ' ' + op.apellido : ''}</td>
                        <td className="py-3 pr-4 text-gray-600">{op.email}</td>
                        <td className="py-3 pr-4 text-gray-600">{op.telefono || '—'}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${op.estado_disponibilidad ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {op.estado_disponibilidad ? 'Disponible' : 'No disponible'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${op.usuario?.estado_cuenta === 'Suspendido' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {op.usuario?.estado_cuenta || 'Activo'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => startEditOp(op)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Editar">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => toggleOpAccountStatus(op)} className={`p-1.5 rounded-lg transition-all ${op.usuario?.estado_cuenta === 'Suspendido' ? 'text-red-500 hover:text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`} title={op.usuario?.estado_cuenta === 'Suspendido' ? 'Reactivar cuenta' : 'Suspender cuenta'}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </button>
                            <button onClick={() => handleViewOpSuspension(op)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Historial suspensiones">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
            <Pagination page={pageOp} totalPages={totalPagesOp} total={totalOp} onPageChange={(p) => loadOperadores(p, searchOp)} />
          </div>
        </>
      ) : tab === 'admin' ? (
        <>
          <CollapsibleForm show={showAdminForm} onToggle={() => setShowAdminForm(!showAdminForm)} icon="A" iconBg="bg-gradient-to-br from-violet-500 to-purple-700" title="Registrar nuevo administrador" subtitle="Cree una cuenta con permisos de administrador">
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className={labelClass}>Nombre</label><input value={adminForm.nombre} onChange={e => setAdminForm({ ...adminForm, nombre: e.target.value })} placeholder="Ej. Luis" className={inputClass} required /></div>
                <div><label className={labelClass}>Apellido</label><input value={adminForm.apellido} onChange={e => setAdminForm({ ...adminForm, apellido: e.target.value })} placeholder="Ej. Perez" className={inputClass} /></div>
                <div><label className={labelClass}>Cédula</label><input value={adminForm.cedula} onChange={e => setAdminForm({ ...adminForm, cedula: e.target.value })} placeholder="Ej. V-12345678" className={inputClass} /></div>
                <div><label className={labelClass}>Teléfono</label><input value={adminForm.telefono} onChange={e => setAdminForm({ ...adminForm, telefono: e.target.value })} placeholder="Ej. 0412-1234567" className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className={labelClass}>Correo electrónico</label><input type="email" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} placeholder="Ej. admin@dronsalud.com" className={inputClass} required /></div>
                <div><label className={labelClass}>Contraseña</label><input type="password" value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} placeholder="Min. 6 caracteres" className={inputClass} required /></div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl active:scale-[0.98]">Registrar administrador</button>
            </form>
          </CollapsibleForm>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Administradores registrados ({totalAdmin})</h3>
              <SearchBar value={searchInputAdmin} onChange={setSearchInputAdmin} placeholder="Buscar admin..." />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                    <th className="text-left pb-3 pr-4 w-10"></th>
                    <th className="text-left pb-3 pr-4">Nombre</th>
                    <th className="text-left pb-3 pr-4">Email</th>
                    <th className="text-left pb-3 pr-4">Teléfono</th>
                    <th className="text-left pb-3 pr-4">Estado</th>
                    <th className="text-left pb-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.length === 0 ? (
                    <tr><td colSpan="6" className="py-8 text-center text-gray-400 text-sm">No hay administradores registrados</td></tr>
                  ) : (
                    admins.map(u => (
                      <tr key={u.id_usuario} className="border-b border-gray-50">
                        <td className="py-3 pr-4">
                          <Avatar src={u.foto_url} name={u.nombre} size="sm" />
                        </td>
                        <td className="py-3 pr-4 font-semibold text-gray-800">{u.nombre} {u.apellido || ''}</td>
                        <td className="py-3 pr-4 text-gray-600">{u.email}</td>
                        <td className="py-3 pr-4 text-gray-600">{u.telefono || '—'}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.estado_cuenta === 'Activo' ? 'bg-emerald-50 text-emerald-600' : u.estado_cuenta === 'Suspendido' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                            {u.estado_cuenta}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => toggleAdminStatus(u)} className={`p-1.5 rounded-lg transition-all ${u.estado_cuenta === 'Suspendido' ? 'text-red-500 hover:text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`} title={u.estado_cuenta === 'Suspendido' ? 'Reactivar cuenta' : 'Suspender cuenta'}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </button>
                            <button onClick={() => handleViewAdminSuspension(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Historial suspensiones">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                            <button onClick={() => setConfirmDelete({ type: 'usuario', item: u })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Eliminar">
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
            <Pagination page={pageAdmin} totalPages={totalPagesAdmin} total={totalAdmin} onPageChange={(p) => loadAdmins(p, searchAdmin)} />
          </div>
        </>
      ) : (
        <>
          <CollapsibleForm show={showFarmForm} onToggle={() => setShowFarmForm(!showFarmForm)} icon="F" iconBg="bg-gradient-to-br from-emerald-500 to-teal-600" title="Registrar nueva farmacia" subtitle="Haga clic en el mapa para ubicar la farmacia">
            <form onSubmit={handleFarmSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className={labelClass}>Nombre</label><input value={farmForm.nombre_comercial} onChange={e => setFarmForm({ ...farmForm, nombre_comercial: e.target.value })} placeholder="Ej. Farmatodo" className={inputClass} required /></div>
                <div><label className={labelClass}>RIF</label><input value={farmForm.rif} onChange={e => setFarmForm({ ...farmForm, rif: e.target.value })} placeholder="Ej. J-12345678-9" className={inputClass} required /></div>
              </div>
              <div>
                <label className={labelClass}>Ubicacion</label>
                <div className="h-[280px] rounded-2xl overflow-hidden border border-gray-200 mb-3">
                  <MapContainer key={showFarmForm ? 'visible' : 'hidden'} center={CENTER} zoom={14} className="h-full w-full" zoomControl={false} maxBounds={TACHIRA_BOUNDS} maxBoundsViscosity={1}>
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
                <div><label className={labelClass}>Ciudad</label><input value={farmForm.ciudad} onChange={e => setFarmForm({ ...farmForm, ciudad: e.target.value })} placeholder="San Cristóbal" className={inputClass} /></div>
                <div><label className={labelClass}>Correo electronico</label><input type="email" value={farmForm.correo} onChange={e => setFarmForm({ ...farmForm, correo: e.target.value })} placeholder="Ej. contacto@farmacia.com" className={inputClass} /></div>
                <div><label className={labelClass}>Numero de telefono</label><input value={farmForm.telefono} onChange={e => setFarmForm({ ...farmForm, telefono: e.target.value })} placeholder="Ej. 0276-3561234" className={inputClass} /></div>
                <div><label className={labelClass}>Telefono del responsable</label><input value={farmForm.telefono_responsable} onChange={e => setFarmForm({ ...farmForm, telefono_responsable: e.target.value })} placeholder="Ej. 0412-1234567" className={inputClass} /></div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl active:scale-[0.98]">Registrar farmacia</button>
            </form>
          </CollapsibleForm>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Farmacias registradas ({totalFarm})</h3>
              <SearchBar value={searchInputFarm} onChange={setSearchInputFarm} placeholder="Buscar farmacia..." />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                    <th className="text-left pb-3 pr-4 w-10"></th>
                    <th className="text-left pb-3 pr-4">Nombre</th>
                    <th className="text-left pb-3 pr-4">Email</th>
                    <th className="text-left pb-3 pr-4">Teléfono</th>
                    <th className="text-left pb-3 pr-4">Estado</th>
                    <th className="text-left pb-3 pr-4">Cuenta</th>
                    <th className="text-left pb-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {farmacias.length === 0 ? (
                    <tr><td colSpan="7" className="py-8 text-center text-gray-400 text-sm">No hay farmacias registradas</td></tr>
                  ) : (
                    farmacias.map((p) => (
                      <tr key={p.id_farmacia} className="border-b border-gray-50">
                        <td className="py-3 pr-4">
                          <Avatar src={p.logo_url} name={p.nombre_comercial} size="sm" rounded="lg" />
                        </td>
                        <td className="py-3 pr-4 font-semibold text-gray-800">{p.nombre_comercial}</td>
                        <td className="py-3 pr-4 text-gray-600">{p.email || '—'}</td>
                        <td className="py-3 pr-4 text-gray-600">{p.telefono || '—'}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.estado_operativo ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {p.estado_operativo ? 'Abierto' : 'Cerrado'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {(() => {
                            const u = farmUsuariosMap[p.id_farmacia]
                            const status = u?.estado_cuenta || '—'
                            const color = status === 'Activo' ? 'bg-emerald-50 text-emerald-600' : status === 'Suspendido' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'
                            return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${color}`}>{status}</span>
                          })()}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => startEditFarm(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Editar">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            {farmUsuariosMap[p.id_farmacia] && (
                              <button onClick={() => toggleFarmAccountStatus(p)} className={`p-1.5 rounded-lg transition-all ${farmUsuariosMap[p.id_farmacia]?.estado_cuenta === 'Suspendido' ? 'text-red-500 hover:text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`} title={farmUsuariosMap[p.id_farmacia]?.estado_cuenta === 'Suspendido' ? 'Reactivar cuenta' : 'Suspender cuenta'}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                              </button>
                            )}
                            <button onClick={() => handleViewFarmSuspension(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Historial suspensiones">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
            <Pagination page={pageFarm} totalPages={totalPagesFarm} total={totalFarm} onPageChange={(p) => loadFarmacias(p, searchFarm)} />
          </div>
        </>
      )}

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
              <div className="flex flex-col items-center pt-2">
                <label className={labelClass}>Foto de perfil</label>
                {(editingOp.foto_url || editingOp.usuario?.foto_url) ? (
                  <button onClick={() => setExpandedPhoto(editingOp.foto_url || editingOp.usuario?.foto_url)} className="cursor-pointer transition-transform hover:scale-105" title="Click para ampliar">
                    <Avatar src={editingOp.foto_url || editingOp.usuario?.foto_url} name={editingOp.nombre_operador} size="xl" />
                  </button>
                ) : (
                  <Avatar src={null} name={editingOp.nombre_operador} size="xl" />
                )}
                <p className="text-xs text-gray-400 mt-1">{(editingOp.foto_url || editingOp.usuario?.foto_url) ? 'Click para ampliar' : 'Sin foto'}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingOp(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">Cancelar</button>
                <button onClick={saveEditOp} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.98] transition-all">Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <div className="flex flex-col items-center pt-2">
                <label className={labelClass}>Logo</label>
                {editingFarm.logo_url ? (
                  <button onClick={() => setExpandedPhoto(editingFarm.logo_url)} className="cursor-pointer transition-transform hover:scale-105" title="Click para ampliar">
                    <Avatar src={editingFarm.logo_url} name={editingFarm.nombre_comercial} size="xl" rounded="xl" />
                  </button>
                ) : (
                  <Avatar src={null} name={editingFarm.nombre_comercial} size="xl" rounded="xl" />
                )}
                <p className="text-xs text-gray-400 mt-1">{editingFarm.logo_url ? 'Click para ampliar' : 'Sin logo'}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setEditingFarm(null); setEditFarmMarkerPos(null) }} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">Cancelar</button>
                <button onClick={saveEditFarm} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl active:scale-[0.98] transition-all">Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {opSuspendModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setOpSuspendModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center"><svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Suspender operador</h3>
              <p className="text-sm text-gray-500">¿Por qué se suspende a <strong>{opSuspendModal.nombre_operador} {opSuspendModal.apellido}</strong>?</p>
            </div>
            <textarea value={opSuspendReason} onChange={e => setOpSuspendReason(e.target.value)} placeholder="Describa el motivo..." rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 mb-6" required />
            <div className="flex gap-3">
              <button onClick={() => setOpSuspendModal(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmSuspendOp} disabled={!opSuspendReason.trim()} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 text-white font-bold text-sm shadow-lg shadow-amber-500/25 disabled:opacity-50">Suspender</button>
            </div>
          </div>
        </div>
      )}

      {opSuspensionInfo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setOpSuspensionInfo(null)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-gray-900">Historial de Suspensiones</h3><button onClick={() => setOpSuspensionInfo(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button></div>
            {opSuspensionInfo.length === 0 ? <p className="text-center text-gray-400 py-4">Sin suspensiones</p> :
              <div className="space-y-3">{opSuspensionInfo.map(s => (
                <div key={s.id_suspension} className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center justify-between mb-2"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.fecha_activacion ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{s.fecha_activacion ? 'Reactivado' : 'Suspendido'}</span><span className="text-xs text-gray-400">{new Date(s.fecha_suspension).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}</span></div>
                  {s.motivo && <p className="text-sm text-gray-700"><span className="font-semibold">Motivo:</span> {s.motivo}</p>}
                  {s.suspendidoPor && <p className="text-xs text-gray-500">Por: {s.suspendidoPor.nombre} {s.suspendidoPor.apellido}</p>}
                  {s.fecha_activacion && <p className="text-xs text-gray-500">Reactivado: {new Date(s.fecha_activacion).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}</p>}
                </div>))}
              </div>}
          </div>
        </div>
      )}

      {suspendAdminModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSuspendAdminModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center"><svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Suspender administrador</h3>
              <p className="text-sm text-gray-500">¿Por qué se suspende a <strong>{suspendAdminModal.nombre} {suspendAdminModal.apellido}</strong>?</p>
            </div>
            <textarea value={suspendAdminReason} onChange={e => setSuspendAdminReason(e.target.value)} placeholder="Describa el motivo..." rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 mb-6" required />
            <div className="flex gap-3">
              <button onClick={() => setSuspendAdminModal(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmSuspendAdmin} disabled={!suspendAdminReason.trim()} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 text-white font-bold text-sm shadow-lg shadow-amber-500/25 disabled:opacity-50">Suspender</button>
            </div>
          </div>
        </div>
      )}

      {adminSuspensionInfo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setAdminSuspensionInfo(null)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-gray-900">Historial de Suspensiones</h3><button onClick={() => setAdminSuspensionInfo(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button></div>
            {adminSuspensionInfo.length === 0 ? <p className="text-center text-gray-400 py-4">Sin suspensiones</p> :
              <div className="space-y-3">{adminSuspensionInfo.map(s => (
                <div key={s.id_suspension} className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center justify-between mb-2"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.fecha_activacion ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{s.fecha_activacion ? 'Reactivado' : 'Suspendido'}</span><span className="text-xs text-gray-400">{new Date(s.fecha_suspension).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}</span></div>
                  {s.motivo && <p className="text-sm text-gray-700"><span className="font-semibold">Motivo:</span> {s.motivo}</p>}
                  {s.suspendidoPor && <p className="text-xs text-gray-500">Por: {s.suspendidoPor.nombre} {s.suspendidoPor.apellido}</p>}
                  {s.fecha_activacion && <p className="text-xs text-gray-500">Reactivado: {new Date(s.fecha_activacion).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}</p>}
                </div>))}
              </div>}
          </div>
        </div>
      )}

      {farmSuspendModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setFarmSuspendModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center"><svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Suspender farmacia</h3>
              <p className="text-sm text-gray-500">¿Por qué se suspende a <strong>{farmSuspendModal.nombre_comercial}</strong>?</p>
            </div>
            <textarea value={farmSuspendReason} onChange={e => setFarmSuspendReason(e.target.value)} placeholder="Describa el motivo..." rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 mb-6" required />
            <div className="flex gap-3">
              <button onClick={() => setFarmSuspendModal(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmSuspendFarm} disabled={!farmSuspendReason.trim()} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 text-white font-bold text-sm shadow-lg shadow-amber-500/25 disabled:opacity-50">Suspender</button>
            </div>
          </div>
        </div>
      )}

      {expandedPhoto && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setExpandedPhoto(null)}>
          <button onClick={() => setExpandedPhoto(null)} className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={expandedPhoto.startsWith('http') ? expandedPhoto : 'http://localhost:3000' + expandedPhoto} alt="Foto" className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

    </div>
  )
}
