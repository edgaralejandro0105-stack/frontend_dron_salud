import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import logo from '../assets/Dron_Salud.png'
import SidebarItem from '../components/ui/SidebarItem'
import UserProfileCard from '../components/ui/UserProfileCard'
import Avatar from '../components/ui/Avatar'
import AdminDashboard from '../pages/admin/DashboardPage'
import PharmacyDashboard from '../pages/pharmacy/DashboardPage'
import InventoryPage from '../pages/pharmacy/InventoryPage'
import OrdersPage from '../pages/admin/OrdersPage'
import FleetPage from '../pages/admin/FleetPage'
import DispatchPage from '../pages/operator/DispatchPage'
import OrdersReceivedPage from '../pages/pharmacy/OrdersReceivedPage'
import OrderHistoryPage from '../pages/pharmacy/OrderHistoryPage'
import OperatorHistoryPage from '../pages/operator/HistoryPage'
import UserManagementPage from '../pages/admin/UserManagementPage'
import ClientsPage from '../pages/admin/ClientsPage'
import SupportButton from '../components/ui/SupportButton'
import PaymentConfigPage from '../pages/pharmacy/PaymentConfigPage'
import PharmacyProfilePage from '../pages/pharmacy/PharmacyProfilePage'

const moduleMap = {
  dashboard: null,
  inventory: InventoryPage,
  orders: OrdersPage,
  fleet: FleetPage,
  'orders-received': OrdersReceivedPage,
  'order-history': OrderHistoryPage,
  'payment-config': PaymentConfigPage,
  dispatch: DispatchPage,
  'delivery-history': OperatorHistoryPage,
  users: UserManagementPage,
  clientes: ClientsPage,
  'pharmacy-profile': PharmacyProfilePage,
}

function NotificationBell({ user, onNavigate }) {
  const [newCount, setNewCount] = useState(0)
  const lastIdsRef = useRef(new Set())

  useEffect(() => {
    if (user?.role !== 'farmacia') return
    try {
      const saved = localStorage.getItem('dronSalud_orders')
      if (saved) {
        const parsed = JSON.parse(saved)
        lastIdsRef.current = new Set(parsed.filter(o => o.estado === 'Pendiente').map(o => o.id))
      }
    } catch {}
    const interval = setInterval(() => {
      try {
        const saved = localStorage.getItem('dronSalud_orders')
        if (!saved) return
        const parsed = JSON.parse(saved)
        const currentIds = new Set(parsed.filter(o => o.estado === 'Pendiente').map(o => o.id))
        const newIds = [...currentIds].filter(id => !lastIdsRef.current.has(id))
        if (newIds.length > 0) {
          setNewCount(prev => prev + newIds.length)
          lastIdsRef.current = currentIds
        }
      } catch {}
    }, 5000)
    return () => clearInterval(interval)
  }, [user])

  if (user?.role !== 'farmacia') return null

  return (
    <button
      onClick={() => { setNewCount(0); onNavigate() }}
      className="relative w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all duration-200 flex-shrink-0"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {newCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
          {newCount > 9 ? '9+' : newCount}
        </span>
      )}
    </button>
  )
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

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) return <div className="p-8 text-red-600 bg-red-50 rounded-2xl m-8"><h2 className="font-bold text-lg mb-2">Error al cargar el módulo</h2><p className="text-sm font-mono">{this.state.error.message}</p></div>
    return this.props.children
  }
}

export default function DashboardLayout({ modules, moduleTitles, user, onLogout, onUpdateUser }) {
  const [activeModule, setActiveModule] = useState(modules[0]?.key || 'dashboard')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [editProfileKey, setEditProfileKey] = useState(0)
  const [clock, setClock] = useState(new Date())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const profileBtnRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!showProfileMenu) return
    function handleClose() { setShowProfileMenu(false) }
    window.addEventListener('scroll', handleClose, { once: true })
    window.addEventListener('resize', handleClose, { once: true })
    return () => {
      window.removeEventListener('scroll', handleClose)
      window.removeEventListener('resize', handleClose)
    }
  }, [showProfileMenu])

  const ModuleComponent = activeModule === 'dashboard'
    ? (user?.role === 'farmacia' ? PharmacyDashboard : AdminDashboard)
    : moduleMap[activeModule]

  function closeSidebar() { setSidebarOpen(false) }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeSidebar} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col bg-gradient-to-b from-[#0b1a30] via-[#0f2248] to-[#142d52] border-r border-white/5 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5">
          <div className="flex flex-col items-center mb-8 animate-fade-in-down">
            <img src={logo} alt="Dron Salud" className="w-40 h-40 object-contain mb-2" />
            <div className="text-[10px] uppercase tracking-[0.3em] text-blue-200/60 font-semibold text-center leading-tight">Logística Médica Inteligente</div>
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
          <div className="flex items-center gap-3 rounded-xl px-4 py-3">
            <Avatar src={user?.foto_url} name={user?.nombre} size="md" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.nombre || 'Usuario'}</div>
              <div className="text-[11px] text-blue-200/50 truncate">{user?.role || ''}</div>
            </div>
          </div>

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
          <div className="flex items-center gap-3 animate-fade-in flex-shrink-0">
            <NotificationBell user={user} onNavigate={() => setActiveModule('ordersReceived')} />
            <Clock date={clock} />
            <div className="relative">
              <button
                ref={profileBtnRef}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 pl-3 pr-2.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
              >
                <Avatar src={user?.foto_url} name={user?.nombre} size="sm" />
                <span className="text-xs font-semibold text-gray-700 hidden sm:block max-w-[100px] truncate">{user?.nombre || 'Usuario'}</span>
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileMenu && profileBtnRef.current && createPortal(
                (() => {
                  const rect = profileBtnRef.current.getBoundingClientRect()
                  return (
                    <div style={{ position: 'fixed', top: rect.bottom + 8, right: window.innerWidth - rect.right, zIndex: 9999, width: '18rem' }} className="bg-white rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.15)] border border-gray-100 animate-scale-in overflow-hidden" onMouseLeave={() => setShowProfileMenu(false)}>
                      <div className="p-5 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <Avatar src={user?.foto_url} name={user?.nombre} size="lg" />
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate">{user?.nombre || 'Usuario'}</div>
                            <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => { setShowProfileMenu(false); setEditProfileKey(k => k + 1) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all text-left"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar perfil
                        </button>
                        <button
                          onClick={onLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all text-left"
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

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <ErrorBoundary>
            {ModuleComponent ? <ModuleComponent user={user} /> : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span>Módulo no disponible</span>
              </div>
            )}
          </ErrorBoundary>
        </div>
      </main>
      {user?.role === 'farmacia' && <SupportButton />}

      {editProfileKey > 0 && <UserProfileCard key={editProfileKey} profile={user} onUpdate={onUpdateUser} defaultOpen modalOnly />}
    </div>
  )
}
