import { useState } from 'react'
import { users } from '../../data/adminData'
import logo from '../../assets/Dron_Salud.png'
import SupportButton from '../../components/ui/SupportButton'
import DroneDelivery from '../../components/ui/DroneDelivery'

function InputField({ label, type = 'text', placeholder = '', icon = null, value, onChange, name }) {
  return (
    <label className="w-full group">
      <div className="text-xs font-semibold text-gray-500 mb-1.5 tracking-wide uppercase">{label}</div>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 transition-all duration-200 text-sm placeholder:text-gray-300`}
        />
      </div>
    </label>
  )
}

function SubmitButton({ children, loading = false }) {
  return (
    <button
      type="submit"
      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-60 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
      disabled={loading}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

function LoginFooter({ onCreate }) {
  return (
    <div className="w-full mt-6 flex items-center justify-center">
      <button
        type="button"
        onClick={onCreate}
        className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors"
      >
        Crear cuenta
      </button>
    </div>
  )
}

export default function LoginPage({ onCreateAccount, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Por favor completa correo y contraseña.')
      return
    }

    const savedCreds = JSON.parse(localStorage.getItem('dronSalud_credentials') || '{}')

    let matchedUser = users.find(
      (u) => u.email === email.trim() && u.password === password,
    )

    if (!matchedUser && savedCreds[email.trim()] === password) {
      matchedUser = users.find(u => u.email === email.trim()) || { email: email.trim(), role: 'admin', nombre: 'Usuario', rol: 'Usuario' }
    }

    if (!matchedUser) {
      setError('Correo o contraseña incorrectos.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (onLoginSuccess) {
        onLoginSuccess(matchedUser)
      }
    }, 800)
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    alert('Flujo de recuperación de contraseña (simulado).')
  }

  const handleCreateAccount = (e) => {
    e.preventDefault()
    if (onCreateAccount) {
      onCreateAccount()
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#081428] via-[#0c1f42] to-[#112a50] overflow-hidden">
      <div className="flex-1 hidden lg:flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-sky-600/5 to-blue-600/5 rounded-full blur-3xl" />
        </div>

          <div className="relative z-10 text-center">
            <DroneDelivery />
          <h1 className="text-4xl font-bold text-white font-['Plus_Jakarta_Sans'] mb-3">
            Dron<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">Salud</span>
          </h1>
          <p className="text-blue-200/50 text-lg max-w-md">
            Logística médica inteligente con drones
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
        <div className="relative z-10 w-full max-w-md animate-fade-in-up">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/20 p-8 md:p-10">
            <div className="lg:hidden flex flex-col items-center mb-8">
              <img src={logo} alt="Dron Salud" className="w-40 h-40 object-contain mb-4" />
              <h2 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">
                Dron<span className="text-blue-600">Salud</span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-sm text-red-600 bg-red-50/80 border border-red-100 p-3 rounded-xl animate-scale-in flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <InputField
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder="correo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={(
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              />

              <InputField
                label="Contraseña"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={(
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-gray-600 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
                  />
                  Recordar sesión
                </label>

                <a href="#forgot" onClick={handleForgotPassword} className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <SubmitButton loading={loading}>
                {loading ? 'Ingresando...' : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    Ingresar
                  </>
                )}
              </SubmitButton>
            </form>

            <LoginFooter onCreate={handleCreateAccount} />
          </div>
        </div>
      </div>
      <SupportButton />
    </div>
  )
}
