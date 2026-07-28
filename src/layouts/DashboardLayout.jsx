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
import ReportsPage from '../pages/admin/ReportsPage'
import TariffsPage from '../pages/admin/TariffsPage'
import SupportButton from '../components/ui/SupportButton'
import PaymentConfigPage    from '../pages/pharmacy/PaymentConfigPage'
import PharmacyProfilePage  from '../pages/pharmacy/PharmacyProfilePage'
import PharmacyReportsPage  from '../pages/pharmacy/ReportsPage'
import { getNotifications } from '../api'
import { useTheme } from '../context/ThemeContext'

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
  tarifas: TariffsPage,
  reports: ReportsPage,
  'pharmacy-profile':  PharmacyProfilePage,
  'pharmacy-reports':  PharmacyReportsPage,
}

function fmtBs(n) {
  const num = Number(n)
  if (isNaN(num) || num === 0) return ''
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function NotificationBell({ user, onNavigate }) {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)

  useEffect(() => {
    const role = user?.role
    if (!role || role === 'cliente') return

    const poll = () => {
      getNotifications()
        .then(data => {
          if (data?.pedidos) {
            setNotifications(prev => {
              const serverIds = new Set(data.pedidos.map(p => p.id_pedido))
              const kept = prev.filter(p => serverIds.has(p.id_pedido))
              const existingIds = new Set(kept.map(p => p.id_pedido))
              const newOnes = data.pedidos.filter(p => !existingIds.has(p.id_pedido))
              return [...newOnes, ...kept].slice(0, 50)
            })
          }
        })
        .catch(() => {})
    }

    poll()
    const id = setInterval(poll, 5000)
    return () => clearInterval(id)
  }, [user?.role, user?.id_farmacia])

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        const panel = document.querySelector('[data-notif-panel]')
        if (panel && !panel.contains(e.target)) setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const role = user?.role
  if (!role || role === 'cliente') return null

  const navigateTo = role === 'farmacia' ? 'orders-received' : 'dispatch'
  const hasNotifications = notifications.length > 0
  const statusLabels = {
    Pendiente: 'Pendiente', Pagado: 'Pagado', Preparado: 'Preparado',
    'En transito': 'En tránsito', Entregado: 'Entregado'
  }

  function handleItemClick(notif) {
    setOpen(false)
    setNotifications(prev => prev.filter(n => n.id_pedido !== notif.id_pedido))
    onNavigate(navigateTo)
  }

  function handleClearAll() {
    setNotifications([])
    setOpen(false)
  }

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
          hasNotifications
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600'
            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
        }`}
        title="Notificaciones"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {hasNotifications && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-red-500 text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-start pointer-events-none" onClick={() => setOpen(false)}>
          <div
            data-notif-panel
            className="pointer-events-auto absolute bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 w-80 overflow-hidden animate-fade-in"
            style={{
              top: btnRef.current ? btnRef.current.getBoundingClientRect().bottom + 8 : 60,
              right: btnRef.current ? window.innerWidth - btnRef.current.getBoundingClientRect().right : 16,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white font-['Plus_Jakarta_Sans']">Notificaciones</h3>
              {hasNotifications && (
                <button onClick={handleClearAll} className="text-[10px] font-semibold text-gray-400 hover:text-red-500 transition-colors">
                  Limpiar todo
                </button>
              )}
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-slate-500">
                  <svg className="w-10 h-10 mb-3 text-gray-200 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="text-xs font-medium">Sin notificaciones</span>
                </div>
              ) : (
                notifications.map(n => (
                  <button
                    key={n.id_pedido}
                    onClick={() => handleItemClick(n)}
                    className="w-full text-left px-4 py-3 border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      n.estado_pedido === 'Preparado' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate">
                        Pedido #{n.id_pedido} · {statusLabels[n.estado_pedido] || n.estado_pedido}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                        {n.farmacia?.nombre_comercial || ''}
                        {n.farmacia && n.cliente ? ' · ' : ''}
                        {n.cliente ? `${n.cliente.nombre || ''} ${n.cliente.apellido || ''}`.trim() : ''}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                        {n.fecha_creacion ? new Date(n.fecha_creacion).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 flex-shrink-0">
                      {fmtBs(n.total)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

function Clock({ date }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-slate-500">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-mono tabular-nums">
        {date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ')}
      </span>
      <span className="text-gray-500 dark:text-slate-600">·</span>
      <span className="font-mono tabular-nums text-gray-300 dark:text-slate-700">
        {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) return <div className="p-8 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-2xl m-8"><h2 className="font-bold text-lg mb-2">Error al cargar el módulo</h2><p className="text-sm font-mono">{this.state.error.message}</p></div>
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
  const { dark, toggle: toggleTheme } = useTheme()

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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden transition-colors duration-500">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeSidebar} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col bg-gradient-to-b from-[#0b1a30] via-[#0f2248] to-[#142d52] border-r border-white/5 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex-1 overflow-y-auto p-5">
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

        <div className="flex-shrink-0 p-5 space-y-3 border-t border-white/5">
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

      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
        <header className="flex-shrink-0 flex items-center justify-between gap-4 px-4 sm:px-8 py-3 sm:py-4 border-b border-gray-100/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl transition-colors duration-500">
          <div className="flex items-center gap-3 min-w-0 animate-fade-in">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-400 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white font-['Plus_Jakarta_Sans'] truncate transition-colors duration-300">
              <span className="bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">{moduleTitles?.[activeModule] || activeModule}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 animate-fade-in flex-shrink-0">
            <NotificationBell user={user} onNavigate={(module) => setActiveModule(module)} />
            <button
              onClick={toggleTheme}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              title={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              {dark ? (
                <svg className="w-4.5 h-4.5 transition-transform duration-500 rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5 transition-transform duration-500 rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Clock date={clock} />
            <div className="relative">
              <button
                ref={profileBtnRef}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 pl-3 pr-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all shadow-sm"
              >
                <Avatar src={user?.foto_url} name={user?.nombre} size="sm" />
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 hidden sm:block max-w-[100px] truncate">{user?.nombre || 'Usuario'}</span>
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileMenu && profileBtnRef.current && createPortal(
                (() => {
                  const rect = profileBtnRef.current.getBoundingClientRect()
                  return (
                    <div style={{ position: 'fixed', top: rect.bottom + 8, right: window.innerWidth - rect.right, zIndex: 9999, width: '18rem' }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.4)] border border-gray-100 dark:border-slate-700 animate-scale-in overflow-hidden" onMouseLeave={() => setShowProfileMenu(false)}>
                      <div className="p-5 pb-3 border-b border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <Avatar src={user?.foto_url} name={user?.nombre} size="lg" />
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.nombre || 'Usuario'}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400 truncate">{user?.email || ''}</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => { setShowProfileMenu(false); setEditProfileKey(k => k + 1) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-left"
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
