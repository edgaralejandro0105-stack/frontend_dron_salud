import { useState, useEffect, useRef } from 'react'
import { getProfile, updateProfile, changePassword, uploadFile } from '../../api'
import Avatar from './Avatar'

const inputClass = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-gray-800 text-sm font-medium transition-all duration-200'
const labelClass = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5'

export default function UserProfileCard({ profile, onUpdate, defaultOpen, modalOnly }) {
  const [showModal, setShowModal] = useState(!!defaultOpen)
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({
    nombre: '', apellido: '', cedula: '', email: '', telefono: '', foto_url: ''
  })
  const [passForm, setPassForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!showModal) return
    getProfile().then(data => {
      setForm({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        cedula: data.cedula || '',
        email: data.email || '',
        telefono: data.telefono || '',
        foto_url: data.foto_url || '',
      })
    }).catch(() => {})
  }, [showModal])

  async function handleSaveProfile(e) {
    e.preventDefault()
    setError('')
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.email.trim()) { setError('El correo es obligatorio'); return }
    setSaving(true)
    try {
      const userId = profile?.id_usuario
      if (!userId) throw new Error('ID no disponible')
      await updateProfile({
        nombre: form.nombre, apellido: form.apellido,
        email: form.email, telefono: form.telefono,
        foto_url: form.foto_url,
      })
      const fullName = form.nombre + ' ' + (form.apellido || '')
      const updated = { ...profile, ...form, nombre: fullName, foto_url: form.foto_url }
      if (onUpdate) onUpdate(updated)
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...savedUser, ...updated }))
      setSaved(true)
      setTimeout(() => { setSaved(false) }, 2000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al guardar')
    }
    setSaving(false)
  }

  async function handleSavePassword(e) {
    e.preventDefault()
    setError('')
    if (!passForm.currentPassword) { setError('Ingresa tu contraseña actual'); return }
    if (passForm.newPassword.length < 6) { setError('La nueva contraseña debe tener al menos 6 caracteres'); return }
    if (passForm.newPassword !== passForm.confirmPassword) { setError('Las contraseñas no coinciden'); return }
    setSaving(true)
    try {
      await changePassword(passForm.currentPassword, passForm.newPassword)
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSaved(true)
      setTimeout(() => { setSaved(false) }, 2000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cambiar contraseña')
    }
    setSaving(false)
  }

  function closeModal() {
    setShowModal(false)
    setTab('profile')
    setError('')
    setSaved(false)
  }

  async function handleFileUpload(file) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const result = await uploadFile(file)
      setForm(prev => ({ ...prev, foto_url: result.url }))
    } catch {
      setError('Error al subir la imagen')
    }
    setUploading(false)
  }

  const isPharmacy = profile?.role === 'farmacia'
  const readOnly = isPharmacy
  const avatarSrc = form.foto_url || null

  const TabBtn = ({ id, label, icon }) => (
    <button
      onClick={() => { setTab(id); setError(''); setSaved(false) }}
      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
        tab === id
          ? 'bg-white text-gray-900 shadow-sm shadow-gray-200/50 border border-gray-200'
          : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon}
      {label}
    </button>
  )

  const modal = showModal && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', padding: '1rem' }} onClick={closeModal}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div className="relative px-8 pt-8 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A9 9 0 0112 15c2.114 0 4.066.71 5.621 1.904M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Configuración</h3>
                <p className="text-xs text-gray-400 mt-0.5">{!isPharmacy ? 'Administra tu cuenta' : 'Tu información de perfil'}</p>
              </div>
            </div>
            <button onClick={closeModal} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all text-lg shrink-0">&times;</button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 p-1 bg-gray-100/80 rounded-2xl mb-6">
            <TabBtn id="profile" label="Datos personales" icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            } />
            <TabBtn id="security" label="Seguridad" icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            } />
          </div>
        </div>

        {/* Messages */}
        <div className="px-8">
          {error && (
            <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2.5 mb-4">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
          {saved && (
            <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-2.5 mb-4">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {tab === 'profile' ? 'Datos actualizados correctamente' : 'Contraseña cambiada correctamente'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-8 pb-8 overflow-y-auto max-h-[50vh]">
          {tab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo */}
              <div className="flex items-center gap-5 pb-4 border-b border-gray-100">
                <div className="relative group flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-gray-100 flex items-center justify-center shadow-inner">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Foto" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class=\"text-2xl font-bold text-indigo-400\">' + (form.nombre?.charAt(0) || '?') + '</span>' }} />
                    ) : (
                      <span className="text-2xl font-bold text-indigo-400">{form.nombre?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  {!isPharmacy && (
                    <>
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-all hover:shadow-lg hover:shadow-blue-500/10 disabled:opacity-50">
                        {uploading ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
                    </>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">{form.nombre || 'Tu nombre'}</div>
                  {!isPharmacy && <div className="text-xs text-gray-400 mt-0.5">Toca la cámara para cambiar tu foto</div>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className={inputClass + ' pl-9' + (readOnly ? ' bg-gray-100 text-gray-500 cursor-not-allowed' : '')} required disabled={readOnly} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Apellido</label>
                  <input value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} placeholder="Apellido" className={inputClass + (readOnly ? ' bg-gray-100 text-gray-500 cursor-not-allowed' : '')} disabled={readOnly} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Cédula</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="7" width="18" height="14" rx="2" ry="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 10h4M7 14h6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input value={form.cedula} disabled className={inputClass + ' pl-9 bg-gray-100 text-gray-500 cursor-not-allowed'} />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {!isPharmacy ? 'La cédula no se puede modificar. Si necesitas cambiarla, contacta a soporte.' : 'Cédula registrada'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Correo electrónico</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@email.com" className={inputClass + ' pl-9' + (readOnly ? ' bg-gray-100 text-gray-500 cursor-not-allowed' : '')} required disabled={readOnly} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="0412-1234567" className={inputClass + ' pl-9' + (readOnly ? ' bg-gray-100 text-gray-500 cursor-not-allowed' : '')} disabled={readOnly} />
                  </div>
                </div>
              </div>
              {!isPharmacy && (
                <div className="pt-3">
                  <button type="submit" disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 text-sm">
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className={labelClass}>Contraseña actual</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input type="password" value={passForm.currentPassword} onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} placeholder="••••••••" className={inputClass + ' pl-9'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nueva contraseña</label>
                  <input type="password" value={passForm.newPassword} onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} placeholder="Min. 6 caracteres" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Confirmar</label>
                  <input type="password" value={passForm.confirmPassword} onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })} placeholder="Repetir" className={inputClass} />
                </div>
              </div>
              <div className="pt-3">
                <button type="submit" disabled={saving}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 rounded-2xl transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 text-sm">
                  {saving ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {!modalOnly && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 pb-2 border-b border-white/10">
            <Avatar src={profile?.foto_url} name={profile?.nombre} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{profile?.nombre || 'Usuario'}</div>
              <div className="text-xs text-blue-200/60">{profile?.rol || ''}</div>
            </div>
            <button
              onClick={() => { setForm({
                nombre: profile?.nombre?.split(' ')[0] || '',
                apellido: profile?.apellido || '',
                cedula: profile?.cedula || '',
                email: profile?.email || '',
                telefono: profile?.telefono || '',
                foto_url: profile?.foto_url || '',
              }); setError(''); setShowModal(true) }}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-blue-200/60 hover:text-white transition-all shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-blue-200/40 uppercase tracking-widest mb-1">Email</div>
            <div className="text-xs text-blue-200/70 font-medium break-all leading-tight">{profile?.email || '—'}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-blue-200/40 uppercase tracking-widest mb-1">Teléfono</div>
            <div className="text-xs text-white font-semibold">{profile?.telefono || '—'}</div>
          </div>
        </div>
      )}

      {modal}
    </>
  )
}
