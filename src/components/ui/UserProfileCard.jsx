import { useState } from 'react'

const CRED_KEY = 'dronSalud_credentials'

function saveUserPassword(email, newPassword) {
  const saved = JSON.parse(localStorage.getItem(CRED_KEY) || '{}')
  saved[email] = newPassword
  localStorage.setItem(CRED_KEY, JSON.stringify(saved))
}

export default function UserProfileCard({ profile, onUpdate, defaultOpen, modalOnly }) {
  const [showModal, setShowModal] = useState(!!defaultOpen)
  const [editEmail, setEditEmail] = useState(profile?.email || '')
  const [editPassword, setEditPassword] = useState('')
  const [editConfirm, setEditConfirm] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleSave(e) {
    e.preventDefault()
    setError('')

    if (!editEmail.trim()) { setError('El correo es obligatorio'); return }
    if (editPassword && editPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (editPassword !== editConfirm) { setError('Las contraseñas no coinciden'); return }

    if (editPassword) {
      saveUserPassword(editEmail.trim(), editPassword)
    }

    if (editEmail.trim() !== profile.email) {
      saveUserPassword(editEmail.trim(), editPassword || '')
    }

    setSaved(true)
    setTimeout(() => { setSaved(false); setShowModal(false) }, 1800)

    if (onUpdate) {
      onUpdate({ ...profile, email: editEmail.trim() })
    }
  }

  return (
    <>
      {!modalOnly && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 pb-2 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              {profile?.nombre?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{profile?.nombre || 'Usuario'}</div>
              <div className="text-xs text-blue-200/60">{profile?.rol || ''}</div>
            </div>
            <button
              onClick={() => { setEditEmail(profile?.email || ''); setEditPassword(''); setEditConfirm(''); setError(''); setShowModal(true) }}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-blue-200/60 hover:text-white transition-all shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
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

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-8 pb-5 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Editar perfil</h3>
                <p className="text-sm text-gray-500 mt-1">Actualiza tu correo electrónico o contraseña</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all text-xl">&times;</button>
            </div>

            <form onSubmit={handleSave} className="p-8 pt-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Correo electrónico</label>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    placeholder="correo@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-800 text-base font-semibold rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nueva contraseña</label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                      type="password"
                      value={editPassword}
                      onChange={e => setEditPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-800 text-base font-semibold rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Confirmar</label>
                  <input
                    type="password"
                    value={editConfirm}
                    onChange={e => setEditConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-800 text-base font-semibold rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 flex items-center gap-2.5">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {saved && (
                <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5 flex items-center gap-2.5">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Datos actualizados correctamente
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 text-base font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-3.5 rounded-2xl transition-all duration-200">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 text-base font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 px-4 py-3.5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.97]">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
