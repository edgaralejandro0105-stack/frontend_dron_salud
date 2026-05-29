import React, { useState } from 'react'
// Usa la imagen `Dron_Salud.png` ubicada en `src/assets/`.
// Añade el archivo `Dron_Salud.png` a esa ruta si aún no existe.
import logo from '../assets/Dron_Salud.png'

function LoginHeader() {
  return (
    <div className="flex items-center justify-center text-center mb-6">
      <img src={logo} alt="Dron Salud" className="w-64 h-36 object-contain mx-auto" />
    </div>
  )
}

function InputField({ label, type = 'text', placeholder = '', icon = null, value, onChange, name }) {
  return (
    <label className="w-full">
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white`}
        />
      </div>
    </label>
  )
}

function SubmitButton({ children, loading = false }) {
  return (
    <button
      type="submit"
      className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-60"
      disabled={loading}
    >
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
        className="text-sm text-blue-700 hover:underline font-semibold"
      >
        Crear cuenta
      </button>
    </div>
  )
}

export default function LoginFormView({ onCreateAccount, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const validCredentials = [
    { email: 'operador@dronesalud.com', password: 'Dron1234!' },
    { email: 'admin@dronesalud.com', password: 'Admin1234!' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Por favor completa correo y contraseña.')
      return
    }

    const credentials = { email: email.trim(), password, remember }
    console.log('Enviando credenciales (simulado):', credentials)

    const matched = validCredentials.some(
      (user) => user.email === credentials.email && user.password === credentials.password,
    )

    if (!matched) {
      setError('Correo o contraseña incorrectos. Usa las credenciales falsas para ingresar.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    }, 800)
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    console.log('Acción: Olvidó su contraseña - abrir flujo de recuperación (simulado).')
    alert('Flujo de recuperación de contraseña (simulado).')
  }

  const handleCreateAccount = (e) => {
    e.preventDefault()
    if (onCreateAccount) {
      onCreateAccount()
      return
    }
    console.log('Acción: Crear cuenta - abrir formulario de registro (simulado).')
    alert('Flujo de creación de cuenta (simulado).')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl shadow-xl p-8 md:p-10">
        <LoginHeader />

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-2 rounded">{error}</div>
          )}

          <InputField
            label="CORREO ELECTRÓNICO"
            name="email"
            type="email"
            placeholder="correo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={(
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            )}
          />

          <InputField
            label="CONTRASEÑA"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={(
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></rect>
                <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            )}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              Recordar sesión
            </label>

            <a href="#forgot" onClick={handleForgotPassword} className="text-sm text-blue-700 hover:underline">
              ¿OLVIDÓ SU CONTRASEÑA?
            </a>
          </div>

          <SubmitButton loading={loading}>
            {loading ? 'Ingresando...' : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
                Ingresar
              </>
            )}
          </SubmitButton>

          <LoginFooter onCreate={handleCreateAccount} />
        </form>
      </div>
    </div>
  )
}
