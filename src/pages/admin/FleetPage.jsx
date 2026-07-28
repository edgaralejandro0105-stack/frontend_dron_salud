import { useState, useEffect, useRef, useCallback } from 'react'
import { getDrones, createDron, updateDron, removeDron, getDronHistorial, uploadFile } from '../../api'

const estados = ['Activo', 'Transito', 'Mantenimiento', 'Cancelado']
const PAGE_SIZE = 10

const statusColors = {
  'Activo': 'bg-emerald-500',
  'Transito': 'bg-sky-500',
  'Mantenimiento': 'bg-amber-500',
  'Cancelado': 'bg-gray-500',
}

export default function FleetPage() {
  const [drones, setDrones] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [historyModal, setHistoryModal] = useState(null)

  const loadDrones = useCallback((p = 1, s = '') => {
    getDrones({ search: s || undefined, page: p, limit: PAGE_SIZE }).then(data => {
      setDrones(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
      setPage(data.page || 1)
    }).catch(() => {})
  }, [])

  useEffect(() => { loadDrones(1, search) }, [search, loadDrones])
  useEffect(() => { loadDrones() }, [loadDrones])
  useEffect(() => { const timer = setTimeout(() => setSearch(searchInput), 400); return () => clearTimeout(timer) }, [searchInput])

  useEffect(() => {
    if (modal) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [modal])

  async function handleSave(form) {
    try {
      if (modal.mode === 'add') await createDron(form)
      else await updateDron(modal.drone.id_dron, form)
      setModal(null)
      loadDrones()
    } catch (err) {
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Error al guardar')
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    try {
      await removeDron(confirmDelete.id_dron)
      setConfirmDelete(null)
      loadDrones()
    } catch (err) {
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Error al eliminar')
    }
  }

  async function handleViewHistory(dron) {
    try {
      const data = await getDronHistorial(dron.id_dron)
      setHistoryModal(data)
    } catch (err) { alert('Error al cargar el historial') }
  }

  return (
    <>
      <div className="card-hover bg-white dark:bg-slate-800/90 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] border border-gray-100 dark:border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-700 gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-['Plus_Jakarta_Sans']">Flota de Drones</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{total} drone{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Buscar dron..." className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all w-48" />
            </div>
            <button onClick={() => setModal({ mode: 'add', drone: null })} className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.97]">+ Agregar Dron</button>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-700">
                  <th className="text-left pb-3 pr-3 w-12"></th>
                  <th className="text-left pb-3 pr-4">Matricula</th>
                  <th className="text-left pb-3 pr-4">Modelo</th>
                  <th className="text-left pb-3 pr-4">Estado</th>
                  <th className="text-left pb-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {drones.length === 0 ? (
                  <tr><td colSpan="5" className="py-12 text-center text-gray-400 text-sm">No hay drones registrados</td></tr>
                ) : (
                  drones.map(d => (
                    <tr key={d.id_dron} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 pr-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-200 overflow-hidden ${d.foto_url ? 'p-0' : 'bg-gradient-to-br from-indigo-100 to-blue-100'}`}>
                          {d.foto_url ? <img src={d.foto_url} alt={d.matricula} className="w-full h-full object-cover" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-gray-800 dark:text-slate-200">{d.matricula}</td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-slate-400">{d.modelo}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-block w-2 h-2 rounded-full ${statusColors[d.estado_operativo] || 'bg-gray-400'} mr-1.5`} />
                        <span className="text-xs font-semibold text-gray-700">{d.estado_operativo}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleViewHistory(d)} className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors" title="Ver historial"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg></button>
                          <button onClick={() => setModal({ mode: 'edit', drone: d })} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Editar"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                          <button onClick={() => setConfirmDelete(d)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Eliminar"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-slate-400">Mostrando página {page} de {totalPages} ({total} drones)</p>
              <div className="flex items-center gap-1">
                <button onClick={() => loadDrones(page - 1, search)} disabled={page <= 1} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Anterior</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => loadDrones(p, search)} className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${p === page ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>{p}</button>
                ))}
                <button onClick={() => loadDrones(page + 1, search)} disabled={page >= totalPages} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Siguiente</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && <DroneModal mode={modal.mode} drone={modal.drone} onSave={handleSave} onClose={() => setModal(null)} />}

      {historyModal && <HistoryModal data={historyModal} onClose={() => setHistoryModal(null)} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-['Plus_Jakarta_Sans'] mb-2">¿Está seguro?</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Se eliminará el dron "{confirmDelete.matricula}" ({confirmDelete.modelo})</p>
            <p className="text-xs text-red-500 dark:text-red-400 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold text-sm shadow-lg shadow-red-500/25 hover:shadow-xl active:scale-[0.98] transition-all">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function HistoryModal({ data, onClose }) {
  const { dron, mantenimientos, pedidos } = data

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-['Plus_Jakarta_Sans']">Historial del Dron</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              {dron.matricula} - {dron.modelo}
              <span className={`inline-block w-2 h-2 rounded-full ml-2 ${statusColors[dron.estado_operativo] || 'bg-gray-400'}`} />
              <span className="ml-1 text-xs font-semibold">{dron.estado_operativo}</span>
              {dron.estado_operativo === 'Mantenimiento' && dron.motivo_mantenimiento && (
                <span className="ml-2 text-xs text-amber-600">({dron.motivo_mantenimiento})</span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {mantenimientos.length === 0 && pedidos.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No hay historial registrado para este dron</p>
          ) : (
            <>
              {mantenimientos.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Mantenimientos ({mantenimientos.length})
                  </h4>
                  <div className="space-y-2">{mantenimientos.map(m => (
                    <div key={m.id_mantenimiento} className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.estado === 'Completado' ? 'bg-emerald-100 text-emerald-700' : m.estado === 'En progreso' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>{m.estado}</span>
                        <span className="text-xs text-gray-400">{new Date(m.fecha_ingreso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{m.tipo_servicio}</p>
                      {m.descripcion_falla && <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{m.descripcion_falla}</p>}
                      {m.usuario && <p className="text-xs text-gray-400 mt-1">Registrado por: {m.usuario.nombre} {m.usuario.apellido}</p>}
                      {m.fecha_completado && <p className="text-xs text-gray-400 mt-1">Completado: {new Date(m.fecha_completado).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                    </div>))}
                  </div>
                </div>
              )}
              {pedidos.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>Envios Realizados ({pedidos.length})</h4>
                  <div className="space-y-2">{pedidos.map(p => (
                    <div key={p.id_pedido} className="bg-sky-50/50 rounded-xl p-4 border border-sky-100">
                      <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-sky-700">Pedido #{p.id_pedido}</span><span className="text-xs text-gray-400">{new Date(p.fecha_creacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                      {p.farmacia && <p className="text-xs text-gray-600 dark:text-slate-400">{p.farmacia.nombre_comercial}</p>}
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-slate-400">{p.estado_pedido && <span className={`px-2 py-0.5 rounded-full font-bold ${p.estado_pedido === 'Entregado' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'}`}>{p.estado_pedido}</span>}{p.total != null && <span>Total: Bs. {Number(p.total).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>}</div>
                    </div>))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function DroneModal({ mode, drone, onSave, onClose }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const [form, setForm] = useState(
    drone
      ? {
          modelo: drone.modelo || '',
          fabricante: drone.fabricante || '',
          matricula: drone.matricula || '',
          numero_serie: drone.numero_serie || '',
          peso_maximo_despegue_kg: drone.peso_maximo_despegue_kg || '',
          fecha_adquisicion: drone.fecha_adquisicion ? drone.fecha_adquisicion.split('T')[0] : '',
          estado_operativo: drone.estado_operativo || 'Activo',
          horas_vuelo: drone.horas_vuelo || '',
          foto_url: drone.foto_url || '',
          motivo_mantenimiento: drone.motivo_mantenimiento || '',
        }
      : {
          modelo: '', fabricante: '', matricula: '', numero_serie: '',
          peso_maximo_despegue_kg: '', fecha_adquisicion: '', estado_operativo: 'Activo',
          horas_vuelo: '', foto_url: '', motivo_mantenimiento: '',
        }
  )

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }) }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form }
    payload.peso_maximo_despegue_kg = payload.peso_maximo_despegue_kg ? Number(payload.peso_maximo_despegue_kg) : null
    payload.horas_vuelo = payload.horas_vuelo ? Number(payload.horas_vuelo) : 0
    onSave(payload)
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { const data = await uploadFile(file); setForm(f => ({ ...f, foto_url: data.url || data.secure_url || '' })) }
    catch { alert('Error al subir la imagen') }
    finally { setUploading(false) }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200">{mode === 'add' ? 'Agregar Dron' : 'Editar Dron'}</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-widest mb-1 block">Matricula</label><input name="matricula" value={form.matricula} onChange={handleChange} placeholder="DRN-001" className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200" required /></div>
            <div><label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-widest mb-1 block">Modelo</label><input name="modelo" value={form.modelo} onChange={handleChange} placeholder="DJI M300" className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200" required /></div>
            <div><label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-widest mb-1 block">Fabricante</label><input name="fabricante" value={form.fabricante} onChange={handleChange} placeholder="DJI" className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200" /></div>
            <div><label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-widest mb-1 block">Numero de Serie</label><input name="numero_serie" value={form.numero_serie} onChange={handleChange} placeholder="SN-001" className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200" /></div>
            <div><label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-widest mb-1 block">Peso Max. Despegue (kg)</label><input name="peso_maximo_despegue_kg" type="number" step="0.01" value={form.peso_maximo_despegue_kg} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200" /></div>
            <div><label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-widest mb-1 block">Horas de Vuelo</label><input name="horas_vuelo" type="number" step="0.01" value={form.horas_vuelo} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200" /></div>
            <div><label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-widest mb-1 block">Fecha Adquisicion</label><input name="fecha_adquisicion" type="date" value={form.fecha_adquisicion} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200" /></div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-widest mb-1 block">Estado</label>
              <select name="estado_operativo" value={form.estado_operativo} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200">
                {estados.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          {form.estado_operativo === 'Mantenimiento' && (
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-widest mb-1 block">Motivo de Mantenimiento</label>
              <textarea name="motivo_mantenimiento" value={form.motivo_mantenimiento} onChange={handleChange} placeholder="Describa el motivo del mantenimiento..." rows={3} className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 resize-none" required />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-widest mb-1 block">Foto del Dron</label>
            <div className="flex items-center gap-4">
              {form.foto_url && <img src={form.foto_url} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-slate-600" />}
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 transition-colors">{uploading ? 'Subiendo...' : 'Subir imagen'}</button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">Cancelar</button>
            <button type="submit" className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.98] transition-all">{mode === 'add' ? 'Crear Dron' : 'Guardar cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
