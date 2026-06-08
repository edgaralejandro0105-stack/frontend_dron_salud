import { useState } from 'react'
import logo from '../../assets/Dron_Salud.png'
import ShoppingModule from '../admin/ShoppingModule'
import PurchaseHistory from './PurchaseHistory'
import SupportButton from '../ui/SupportButton'

const tabs = [
  { key: 'shop', label: 'Nuevo Pedido', icon: 'icon' },
  { key: 'history', label: 'Mis Compras', icon: 'icon' },
]

export default function ClientShoppingView({ user, onLogout }) {
  const [showProfile, setShowProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('shop')

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl blur-lg opacity-40" />
            <div className="relative bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-3 border border-white/20">
              <img src={logo} alt="Dron Salud" className="w-12 h-12 object-contain" />
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-blue-500 font-semibold">Log&iacute;stica M&eacute;dica</div>
            <div className="text-lg font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Inteligente</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors hidden sm:block">
              {user?.nombre || 'Usuario'}
            </span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            title="Cerrar sesi&oacute;n"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <nav className="flex-shrink-0 flex items-center gap-1 px-6 py-3 border-b border-gray-100 bg-white/30 backdrop-blur-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-md'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <span className="text-lg">{tab.key === 'shop' ? '\uD83D\uDED2' : '\uD83D\uDCCB'}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {showProfile && (
        <div className="absolute top-16 right-6 z-50 animate-scale-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 min-w-[200px]">
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                {user?.nombre?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">{user?.nombre || 'Usuario'}</div>
                <div className="text-xs text-gray-500">{user?.rol || ''}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div><span className="font-semibold text-gray-600">Email:</span> {user?.email || '&mdash;'}</div>
              <div><span className="font-semibold text-gray-600">Tel&eacute;fono:</span> {user?.telefono || '&mdash;'}</div>
              {user?.direccion && <div><span className="font-semibold text-gray-600">Direcci&oacute;n:</span> {user.direccion}</div>}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">
        {activeTab === 'shop' && <ShoppingModule user={user} />}
        {activeTab === 'history' && <PurchaseHistory user={user} />}
      </main>
      <SupportButton />
    </div>
  )
}
