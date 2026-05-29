import { useState } from 'react'
import LoginFormView from './components/LoginFormView'
import RegisterFormView from './components/RegisterFormView'
import AdminPanelView from './components/AdminPanelView'

function App() {
  const [view, setView] = useState('login')

  if (view === 'register') {
    return <RegisterFormView onBackToLogin={() => setView('login')} />
  }

  if (view === 'admin') {
    return <AdminPanelView onLogout={() => setView('login')} />
  }

  return (
    <LoginFormView
      onCreateAccount={() => setView('register')}
      onLoginSuccess={() => setView('admin')}
    />
  )
}

export default App
