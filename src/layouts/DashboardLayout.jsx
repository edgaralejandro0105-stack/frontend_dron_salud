import { useState, useEffect } from 'react'
import logo from '../assets/Dron_Salud.png'
import SidebarItem from '../components/ui/SidebarItem'
import UserProfileCard from '../components/ui/UserProfileCard'
import DashboardPage from '../pages/admin/DashboardPage'
import InventoryPage from '../pages/pharmacy/InventoryPage'
import OrdersPage from '../pages/admin/OrdersPage'
import FleetPage from '../pages/admin/FleetPage'
import NewOrderPage from '../pages/client/NewOrderPage'
import DispatchPage from '../pages/operator/DispatchPage'
import OrdersReceivedPage from '../pages/pharmacy/OrdersReceivedPage'
import OrderHistoryPage from '../pages/pharmacy/OrderHistoryPage'
import PharmacyDashboardPage from '../pages/pharmacy/DashboardPage'
import OperatorHistoryPage from '../pages/operator/HistoryPage'
import UserManagementPage from '../pages/admin/UserManagementPage'
import SupportButton from '../components/ui/SupportButton'

const moduleMap = {
  dashboard: DashboardPage,
  inventory: InventoryPage,
  orders: OrdersPage,
  fleet: FleetPage,
  shopping: NewOrderPage,
  operator: DispatchPage,
  ordersReceived: OrdersReceivedPage,
  pharmacyHistory: OrderHistoryPage,
  pharmacyDashboard: PharmacyDashboardPage,
  operatorHistory: OperatorHistoryPage,
  adminManagement: UserManagementPage,
}

function Clock({ date }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-mono tabular-nums">
        {date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ')}
      </span>
      <span className="text-gray-500">·</span>
      <span className="font-mono tabular-nums text-gray-300">
        {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}

export default function DashboardLayout({ modules, moduleTitles, user, onLogout }) {
  const [activeModule, setActiveModule] = useState(modules[0]?.key || 'dashboard')
  const [showProfile, setShowProfile] = useState(false)
  const [clock, setClock] = useState(new Date())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const ModuleComponent = moduleMap[activeModule]

  function closeSidebar() { setSidebarOpen(false) }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeSidebar} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col bg-gradient-to-b from-[#0b1a30] via-[#0f2248] to-[#142d52] border-r border-white/5 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-8 animate-fade-in-down">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl blur-lg opacity-40" />
              <div className="relative bg-gradient-to-br from-sky-500/15 to-blue-600/15 rounded-2xl p-3 border border-white/10">
                <img src={logo} alt="Dron Salud" className="w-11 h-11 object-contain" />
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-blue-200/60 font-semibold">Logística Médica</div>
              <div className="text-sm font-bold text-white mt-0.5 font-['Plus_Jakarta_Sans']">Inteligente</div>
            </div>
          </div>

          <nav className="space-y-1">
            {modules.map((m, i) => (
              <div key={m.key} className="animate-slide-in-left" style={{ animationDelay: `${i * 40}ms` }}>
                <SidebarItem
                  icon={m.icon}
                  label={m.label}
                  active={activeModule === m.key}
                  onClick={() => { setActiveModule(m.key); closeSidebar() }}
                />
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-5 space-y-3 border-t border-white/5">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-full group flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 hover:bg-white/5"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.nombre || 'Usuario'}</div>
              <div className="text-[11px] text-blue-200/50 truncate">{user?.rol || ''}</div>
            </div>
            <svg className={`w-4 h-4 text-blue-200/40 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showProfile && (
            <div className="animate-scale-in rounded-xl bg-white/5 border border-white/10 p-4">
              <UserProfileCard profile={user} />
            </div>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 border border-white/10 text-blue-200/60 font-semibold py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-all duration-200 text-sm group"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <header className="flex-shrink-0 flex items-center justify-between gap-4 px-4 sm:px-8 py-3 sm:py-4 border-b border-gray-100/80 bg-white/40 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0 animate-fade-in">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] truncate">
              <span className="bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">{moduleTitles?.[activeModule] || activeModule}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 animate-fade-in flex-shrink-0">
            <Clock date={clock} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          {ModuleComponent ? <ModuleComponent user={user} /> : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <span>Módulo no disponible</span>
            </div>
          )}
        </div>
      </main>
      {user?.role === 'farmacia' && <SupportButton />}
    </div>
  )
}
