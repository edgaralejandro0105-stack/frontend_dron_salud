import { useState } from 'react'
import LoginFormView from './components/LoginFormView'
import RegisterFormView from './components/RegisterFormView'
import AdminPanelView from './components/admin/AdminPanelView'
import ClientShoppingView from './components/client/ClientShoppingView'
import { modules, moduleTitles, roleModules } from './data/adminData'

function App() {
  const [view, setView] = useState('login')
  const [currentUser, setCurrentUser] = useState(null)

  if (view === 'register') {
    return <RegisterFormView onBackToLogin={() => setView('login')} />
  }

  if (view === 'panel' && currentUser) {
    if (currentUser.role === 'cliente') {
      return (
        <ClientShoppingView
          user={currentUser}
          onLogout={() => {
            setView('login')
            setCurrentUser(null)
          }}
        />
      )
    }

    const allowedKeys = roleModules[currentUser.role] || roleModules.admin
    const allowedModules = modules.filter((m) => allowedKeys.includes(m.key))

    return (
      <AdminPanelView
        modules={allowedModules}
        moduleTitles={moduleTitles}
        user={currentUser}
        onLogout={() => {
          setView('login')
          setCurrentUser(null)
        }}
      />
    )
  }

  return (
    <LoginFormView
      onCreateAccount={() => setView('register')}
      onLoginSuccess={(user) => {
        setCurrentUser(user)
        setView('panel')
      }}
    />
  )
}

export default App
