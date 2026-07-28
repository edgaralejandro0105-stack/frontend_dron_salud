import { useState } from 'react'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardLayout from './layouts/DashboardLayout'
import ShoppingPage from './pages/client/ShoppingPage'
import { ThemeProvider } from './context/ThemeContext'

const modules = [
  { key: 'dashboard', label: 'Panel', icon: 'LayoutDashboard', color: 'from-sky-500 to-blue-600' },
  { key: 'orders', label: 'Pedidos', icon: 'Package', color: 'from-violet-500 to-purple-600' },
  { key: 'fleet', label: 'Flota', icon: 'Drone', color: 'from-sky-500 to-blue-600' },
  { key: 'users', label: 'Usuarios', icon: 'Users', color: 'from-emerald-500 to-teal-600' },
  { key: 'clientes', label: 'Clientes', icon: 'User', color: 'from-cyan-500 to-teal-600' },
  { key: 'inventory', label: 'Inventario', icon: 'Pill', color: 'from-rose-500 to-pink-600' },
  { key: 'orders-received', label: 'Ordenes Recibidas', icon: 'ClipboardList', color: 'from-cyan-500 to-sky-600' },
  { key: 'order-history', label: 'Historial de Pedidos', icon: 'History', color: 'from-indigo-500 to-violet-600' },
  { key: 'payment-config', label: 'Config. Pago', icon: 'Wallet', color: 'from-emerald-500 to-green-600' },
  { key: 'pharmacy-profile', label: 'Mi Perfil', icon: 'Settings', color: 'from-blue-500 to-indigo-600' },
  { key: 'pharmacy-reports', label: 'Reportes', icon: 'BarChart', color: 'from-emerald-500 to-teal-600' },
  { key: 'tarifas', label: 'Tarifas', icon: 'DollarSign', color: 'from-sky-500 to-blue-600' },
  { key: 'reports', label: 'Salidas', icon: 'BarChart', color: 'from-indigo-500 to-violet-600' },
  { key: 'dispatch', label: 'Despachar', icon: 'Rocket', color: 'from-rose-500 to-red-600' },
  { key: 'delivery-history', label: 'Historial de Entregas', icon: 'CheckCircle', color: 'from-teal-500 to-emerald-600' },
]
const moduleTitles = {
  dashboard: 'Panel', orders: 'Pedidos', fleet: 'Flota', users: 'Usuarios',
  clientes: 'Clientes',
  inventory: 'Inventario', 'orders-received': 'Ordenes Recibidas',
  'order-history': 'Historial de Pedidos', 'payment-config': 'Config. Pago',
  tarifas: 'Tarifas',
  reports: 'Salidas',
  dispatch: 'Despachar', 'delivery-history': 'Historial de Entregas',
  'pharmacy-profile': 'Mi Perfil',
  'pharmacy-reports': 'Reportes',
}
const roleModules = {
  admin: ['dashboard', 'orders', 'fleet', 'users', 'clientes', 'dispatch', 'reports', 'tarifas'],
  cliente: [],
  farmacia: ['dashboard', 'orders-received', 'order-history', 'inventory', 'payment-config', 'pharmacy-profile', 'pharmacy-reports'],
  operador: ['dispatch', 'delivery-history', 'fleet'],
}

function App() {
  const [view, setView] = useState('login')
  const [currentUser, setCurrentUser] = useState(null)

  const renderPage = () => {
    if (view === 'register') {
      return (
        <RegisterPage
          onBackToLogin={() => setView('login')}
          onLoginSuccess={(user) => {
            setCurrentUser(user)
            setView('panel')
          }}
        />
      )
    }

    if (view === 'panel' && currentUser) {
      if (currentUser.role === 'cliente') {
        return (
          <ShoppingPage
            user={currentUser}
            onLogout={() => {
              setView('login')
              setCurrentUser(null)
            }}
            onUpdateUser={(updated) => setCurrentUser(updated)}
          />
        )
      }

      const allowedKeys = roleModules[currentUser.role] || roleModules.admin
      const allowedModules = modules.filter((m) => allowedKeys.includes(m.key))

      return (
        <DashboardLayout
          modules={allowedModules}
          moduleTitles={moduleTitles}
          user={currentUser}
          onLogout={() => {
            setView('login')
            setCurrentUser(null)
          }}
          onUpdateUser={(updated) => setCurrentUser(updated)}
        />
      )
    }

    return (
      <LoginPage
        onCreateAccount={() => setView('register')}
        onLoginSuccess={(user) => {
          setCurrentUser(user)
          setView('panel')
        }}
      />
    )
  }

  return <ThemeProvider>{renderPage()}</ThemeProvider>
}

export default App
