import { useState } from 'react'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardLayout from './layouts/DashboardLayout'
import ShoppingPage from './pages/client/ShoppingPage'
import { modules, moduleTitles, roleModules } from './data/adminData'

function App() {
  const [view, setView] = useState('login')
  const [currentUser, setCurrentUser] = useState(null)

  if (view === 'register') {
    return <RegisterPage onBackToLogin={() => setView('login')} />
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

export default App
