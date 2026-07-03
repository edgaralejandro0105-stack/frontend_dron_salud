import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import logo from '../../assets/Dron_Salud.png'
import NewOrderPage from './NewOrderPage'
import PurchaseHistoryPage from './PurchaseHistoryPage'
import SupportButton from '../../components/ui/SupportButton'
import UserProfileCard from '../../components/ui/UserProfileCard'
import Avatar from '../../components/ui/Avatar'
import { getSuspensionesByUsuario } from '../../api'

const tabs = [
  { key: 'shop', label: 'Nuevo Pedido' },
  { key: 'history', label: 'Mis Compras' },
]

export default function ShoppingPage({ user, onLogout, onUpdateUser }) {
  const [showProfile, setShowProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('shop')
  const [editProfileKey, setEditProfileKey] = useState(0)
  const [suspensionModal, setSuspensionModal] = useState(null)
  const profileBtnRef = useRef(null)

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-8 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Dron Salud" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
          <div className="hidden sm:block">
            <div className="text-[9px] uppercase tracking-[0.25em] text-sky-600 font-semibold">Logística Médica</div>
            <div className="text-base font-bold text-slate-800 font-['Plus_Jakarta_Sans'] -mt-0.5">Inteligente</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-1 bg-slate-100/80 rounded-2xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.key === 'shop' ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    {tab.label}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {tab.label}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="relative">
            <button
              ref={profileBtnRef}
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2.5 group"
            >
              <Avatar src={user?.foto_url} name={user?.nombre} size="md" rounded="xl" className="shadow-blue-500/25" />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors hidden sm:block">
                {user?.nombre || 'Usuario'}
              </span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfile && profileBtnRef.current && createPortal(
              (() => {
                const rect = profileBtnRef.current.getBoundingClientRect()
                return (
              <div style={{ position: 'fixed', top: rect.bottom + 8, right: window.innerWidth - rect.right, zIndex: 9999, width: '18rem' }} className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100 animate-scale-in overflow-hidden">
                <div className="p-5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <Avatar src={user?.foto_url} name={user?.nombre} size="xl" rounded="xl" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{user?.nombre || 'Usuario'}</div>
                      <div className="text-xs text-slate-500">{user?.role || ''}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-600 truncate">{user?.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-slate-600">{user?.telefono || '—'}</span>
                  </div>
                </div>
                <div className="p-2 border-t border-slate-100">
                  <button
                    onClick={() => { setShowProfile(false); setEditProfileKey(k => k + 1) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all text-left"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar perfil
                  </button>
                  <button
                    onClick={async () => {
                      setShowProfile(false)
                      try {
                        const data = await getSuspensionesByUsuario(user.id_usuario)
                        setSuspensionModal(data)
                      } catch (err) {
                        alert('Error al cargar informacion de la cuenta')
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all text-left"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Estado de cuenta
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all text-left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              </div>
                )
              })(),
              document.body
            )}
          </div>
        </div>
      </header>

      <nav className="sm:hidden flex-shrink-0 flex items-center gap-1 px-4 py-2.5 bg-white border-b border-slate-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-md'
                : 'text-slate-500 hover:text-sky-600 bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'shop' && <NewOrderPage user={user} />}
        {activeTab === 'history' && <PurchaseHistoryPage user={user} />}
      </main>
      {suspensionModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSuspensionModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Estado de mi Cuenta</h3>
              <button onClick={() => setSuspensionModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Historial de suspensiones</h4>
            {suspensionModal.length === 0 ? (
              <p className="text-center text-gray-400 py-4 text-sm">No has sido suspendido</p>
            ) : (
              <div className="space-y-3">
                {suspensionModal.map(s => (
                  <div key={s.id_suspension} className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.fecha_activacion ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {s.fecha_activacion ? 'Reactivado' : 'Suspendido'}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(s.fecha_suspension).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {s.motivo && <p className="text-sm text-gray-700 mb-2"><span className="font-semibold">Motivo:</span> {s.motivo}</p>}
                    {s.suspendidoPor && <p className="text-xs text-gray-500"><span className="font-semibold">Suspendido por:</span> {s.suspendidoPor.nombre} {s.suspendidoPor.apellido}</p>}
                    {s.fecha_activacion && (
                      <p className="text-xs text-gray-500 mt-1">Reactivado: {new Date(s.fecha_activacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <SupportButton />
      {editProfileKey > 0 && <UserProfileCard key={editProfileKey} profile={user} onUpdate={onUpdateUser} defaultOpen modalOnly />}
    </div>
  )
}
