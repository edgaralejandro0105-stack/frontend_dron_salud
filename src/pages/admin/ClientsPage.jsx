import { useState, useEffect, useCallback } from 'react'
import { getUsuarios, updateUsuario, updateUsuarioEstado, register, removeUsuario, getSuspensionesByUsuario } from '../../api'
import Avatar from '../../components/ui/Avatar'

const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition-all duration-200 text-sm'
const labelClass = 'text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block'
const PAGE_SIZE = 10

export default function ClientsPage() {
  const [clientes, setClientes] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [showRegister, setShowRegister] = useState(false)
  const [msg, setMsg] = useState(null)
  const [lastCredentials, setLastCredentials] = useState(null)
  const [editingCliente, setEditingCliente] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [suspendModal, setSuspendModal] = useState(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [suspensionInfo, setSuspensionInfo] = useState(null)
  const [expandedPhoto, setExpandedPhoto] = useState(null)

  const [registerForm, setRegisterForm] = useState({
    nombre: '', apellido: '', cedula: '', email: '', password: '', confirmPassword: '', telefono: ''
  })

  const loadClientes = useCallback((p = 1, s = '') => {
    getUsuarios({ tipo: 'cliente', search: s || undefined, page: p, limit: PAGE_SIZE }).then(data => {
      setClientes(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
      setPage(data.page || 1)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    loadClientes(1, search)
  }, [search, loadClientes])

  useEffect(() => {
    loadClientes()
  }, [loadClientes])

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  function showMsg(text) {
    setMsg(text)
    setTimeout(() => setMsg(null), 5000)
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!registerForm.nombre || !registerForm.cedula || !registerForm.email || !registerForm.password) return
    if (registerForm.password !== registerForm.confirmPassword) {
      showMsg('Las contraseñas no coinciden')
      return
    }
    try {
      await register({
        nombre: registerForm.nombre,
        apellido: registerForm.apellido,
        cedula: registerForm.cedula,
        email: registerForm.email,
        password: registerForm.password,
        telefono: registerForm.telefono,
        tipo_usuario: 'cliente',
      })
      setLastCredentials({ email: registerForm.email, password: registerForm.password })
      showMsg(`Cliente ${registerForm.nombre} registrado correctamente`)
      setRegisterForm({ nombre: '', apellido: '', cedula: '', email: '', password: '', confirmPassword: '', telefono: '' })
      loadClientes()
    } catch (err) {
      showMsg('Error: ' + (err?.response?.data?.message || err?.response?.data?.error || 'Error al registrar'))
    }
  }

  function startEdit(u) {
    setEditForm({
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      cedula: u.cedula || '',
      email: u.email || '',
      telefono: u.telefono || '',
    })
    setEditingCliente(u)
  }

  async function saveEdit() {
    if (!editingCliente) return
    try {
      await updateUsuario(editingCliente.id_usuario, editForm)
      showMsg('Cliente actualizado correctamente')
      setEditingCliente(null)
      loadClientes()
    } catch (err) {
      showMsg('Error: ' + (err?.response?.data?.message || 'Error al actualizar'))
    }
  }

  async function executeDelete() {
    if (!confirmDelete) return
    try {
      await removeUsuario(confirmDelete.id_usuario)
      showMsg('Cliente eliminado correctamente')
      setConfirmDelete(null)
      loadClientes()
    } catch (err) {
      showMsg('Error: ' + (err?.response?.data?.message || 'Error al eliminar'))
    }
  }

  async function toggleStatus(u) {
    if (u.estado_cuenta === 'Activo') {
      setSuspendModal(u)
      setSuspendReason('')
      return
    }
    try {
      await updateUsuarioEstado(u.id_usuario, 'Activo')
      showMsg('Cliente activado correctamente')
      loadClientes()
    } catch (err) {
      showMsg('Error: ' + (err?.response?.data?.message || 'Error al cambiar estado'))
    }
  }

  async function confirmSuspend() {
    if (!suspendModal || !suspendReason.trim()) return
    try {
      await updateUsuarioEstado(suspendModal.id_usuario, 'Suspendido', suspendReason.trim())
      showMsg('Cliente suspendido correctamente')
      setSuspendModal(null)
      setSuspendReason('')
      loadClientes()
    } catch (err) {
      showMsg('Error: ' + (err?.response?.data?.message || 'Error al suspender'))
    }
  }

  async function handleViewSuspension(u) {
    try {
      const data = await getSuspensionesByUsuario(u.id_usuario)
      setSuspensionInfo(data)
    } catch { showMsg('Error al cargar suspensiones') }
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
          <div className="text-xs font-semibold uppercase tracking-widest mb-2">Credenciales del cliente</div>
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

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-6 mb-6">
        <button
          onClick={() => setShowRegister(!showRegister)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-teal-500/20">+</div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Registrar nuevo cliente</h3>
              <p className="text-sm text-gray-400 mt-0.5">Cree una cuenta de cliente en el sistema</p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showRegister ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {showRegister && (
          <form onSubmit={handleRegister} className="space-y-6 mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Nombre</label>
                <input value={registerForm.nombre} onChange={e => setRegisterForm({ ...registerForm, nombre: e.target.value })} placeholder="Ej. Juan" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Apellido</label>
                <input value={registerForm.apellido} onChange={e => setRegisterForm({ ...registerForm, apellido: e.target.value })} placeholder="Ej. Pérez" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Cédula</label>
                <input value={registerForm.cedula} onChange={e => setRegisterForm({ ...registerForm, cedula: e.target.value })} placeholder="Ej. V-12345678" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Correo electrónico</label>
                <input type="email" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} placeholder="Ej. juan@correo.com" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input value={registerForm.telefono} onChange={e => setRegisterForm({ ...registerForm, telefono: e.target.value })} placeholder="Ej. 0412-1234567" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Contraseña</label>
                <input type="password" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} placeholder="Min. 8 caracteres" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Confirmar contraseña</label>
                <input type="password" value={registerForm.confirmPassword} onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} placeholder="Repite la contraseña" className={inputClass} required />
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-teal-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-teal-500/25 hover:shadow-xl active:scale-[0.98]">
              Registrar cliente
            </button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center text-teal-700 text-sm font-bold">C</div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Clientes registrados</h3>
              <p className="text-xs text-gray-400 mt-0.5">{total} cliente{total !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Buscar cliente..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition-all w-56"
              />
            </div>
            <select
              value={estadoFilter}
              onChange={e => setEstadoFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Suspendido">Suspendido</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                <th className="text-left pb-3 pr-4 w-12"></th>
                <th className="text-left pb-3 pr-4">Nombre</th>
                <th className="text-left pb-3 pr-4">Email</th>
                <th className="text-left pb-3 pr-4">Teléfono</th>
                <th className="text-left pb-3 pr-4">Estado</th>
                <th className="text-left pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.filter(u => !estadoFilter || u.estado_cuenta === estadoFilter).length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-gray-400 text-sm">No hay clientes registrados</td></tr>
              ) : (
                clientes.filter(u => !estadoFilter || u.estado_cuenta === estadoFilter).map(u => (
                  <tr key={u.id_usuario} className="border-b border-gray-50">
                    <td className="py-3 pr-4">
                      <Avatar src={u.foto_url} name={u.nombre} size="md" />
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
                        <button onClick={() => startEdit(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => toggleStatus(u)} className={`p-1.5 rounded-lg transition-all ${u.estado_cuenta === 'Activo' ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={u.estado_cuenta === 'Activo' ? 'Suspender' : 'Activar'}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={u.estado_cuenta === 'Activo' ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'} /></svg>
                        </button>
                        <button onClick={() => handleViewSuspension(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Historial suspensiones">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                        <button onClick={() => setConfirmDelete(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Eliminar">
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Mostrando página {page} de {totalPages} ({total} clientes)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => loadClientes(page - 1)}
                disabled={page <= 1}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => loadClientes(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${p === page ? 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-md shadow-teal-500/20' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => loadClientes(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {editingCliente && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setEditingCliente(null)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Editar cliente</h3>
              <button onClick={() => setEditingCliente(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Nombre</label><input value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Apellido</label><input value={editForm.apellido} onChange={e => setEditForm({ ...editForm, apellido: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Cédula</label><input value={editForm.cedula} onChange={e => setEditForm({ ...editForm, cedula: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Email</label><input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Teléfono</label><input value={editForm.telefono} onChange={e => setEditForm({ ...editForm, telefono: e.target.value })} className={inputClass} /></div>
                <div className="flex flex-col items-center">
                  <label className={labelClass}>Foto de perfil</label>
                  {editingCliente.foto_url ? (
                    <button onClick={() => setExpandedPhoto(editingCliente.foto_url)} className="cursor-pointer transition-transform hover:scale-105" title="Click para ampliar">
                      <Avatar src={editingCliente.foto_url} name={editingCliente.nombre} size="xl" />
                    </button>
                  ) : (
                    <Avatar src={editingCliente.foto_url} name={editingCliente.nombre} size="xl" />
                  )}
                  {editingCliente.foto_url ? (
                    <p className="text-xs text-green-600 font-medium mt-1">Click para ampliar</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Sin foto</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingCliente(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">Cancelar</button>
                <button onClick={saveEdit} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-500/25 hover:shadow-xl active:scale-[0.98] transition-all">Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-2">¿Está seguro?</h3>
            <p className="text-sm text-gray-500 mb-1">
              Se eliminará al cliente "{confirmDelete.nombre} {confirmDelete.apellido || ''}"
            </p>
            <p className="text-xs text-gray-400 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">Cancelar</button>
              <button onClick={executeDelete} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold text-sm shadow-lg shadow-red-500/25 hover:shadow-xl active:scale-[0.98] transition-all">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {suspendModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSuspendModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6"><div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center"><svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Suspender cliente</h3><p className="text-sm text-gray-500">¿Por qué se suspende a <strong>{suspendModal.nombre} {suspendModal.apellido}</strong>?</p></div>
            <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Describa el motivo..." rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 mb-6" required />
            <div className="flex gap-3"><button onClick={() => setSuspendModal(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmSuspend} disabled={!suspendReason.trim()} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 text-white font-bold text-sm shadow-lg shadow-amber-500/25 disabled:opacity-50">Suspender</button></div>
          </div>
        </div>
      )}

      {suspensionInfo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSuspensionInfo(null)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-gray-900">Historial de Suspensiones</h3><button onClick={() => setSuspensionInfo(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button></div>
            {suspensionInfo.length === 0 ? <p className="text-center text-gray-400 py-4">Sin suspensiones</p> : <div className="space-y-3">{suspensionInfo.map(s => (
              <div key={s.id_suspension} className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center justify-between mb-2"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.fecha_activacion ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{s.fecha_activacion ? 'Reactivado' : 'Suspendido'}</span><span className="text-xs text-gray-400">{new Date(s.fecha_suspension).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}</span></div>
                {s.motivo && <p className="text-sm text-gray-700"><span className="font-semibold">Motivo:</span> {s.motivo}</p>}
                {s.suspendidoPor && <p className="text-xs text-gray-500">Por: {s.suspendidoPor.nombre} {s.suspendidoPor.apellido}</p>}
                {s.fecha_activacion && <p className="text-xs text-gray-500">Reactivado: {new Date(s.fecha_activacion).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' })}</p>}
              </div>))}</div>}
          </div>
        </div>
      )}

      {expandedPhoto && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setExpandedPhoto(null)}>
          <button onClick={() => setExpandedPhoto(null)} className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img
            src={expandedPhoto.startsWith('http') ? expandedPhoto : 'http://localhost:3000' + expandedPhoto}
            alt="Foto de perfil"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  )
}
