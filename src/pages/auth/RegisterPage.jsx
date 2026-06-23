import { useState } from 'react'
import { register } from '../../api'
import logo from '../../assets/Dron_Salud.png'

function InputField({ label, type = 'text', placeholder = '', icon = null, value, onChange, name }) {
  return (
    <label className="w-full group">
      <div className="text-xs font-semibold text-gray-500 mb-1.5 tracking-wide uppercase">{label}</div>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
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

export default function RegisterPage({ onBackToLogin, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    telefono: '',
    password_hash: '',
    confirmPassword: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [successData, setSuccessData] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (formData.password_hash !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const { nombre, apellido, cedula, email, telefono, password_hash } = formData
      const result = await register({
        nombre, apellido, cedula, email,
        password: password_hash,
        telefono,
        tipo_usuario: 'cliente',
      })
      localStorage.setItem('token', result.token)
      const user = {
        ...result.usuario,
        role: result.usuario.tipo_usuario,
        nombre: result.usuario.nombre + ' ' + (result.usuario.apellido || ''),
      }
      localStorage.setItem('user', JSON.stringify(user))
      setLoading(false)
      setSuccessData(user)
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(user)
      }, 2500)
    } catch (err) {
      setLoading(false)
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Error al crear la cuenta. Intenta de nuevo.'
      setErrorMessage(msg)
    }
  }

  const handleLoginRedirect = (e) => {
    e.preventDefault()
    if (onBackToLogin) onBackToLogin()
  }

  if (successData) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-[#081428] via-[#0c1f42] to-[#112a50]">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md animate-scale-in">
            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-emerald-500/10 border border-emerald-200/50 p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce-soft">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-['Plus_Jakarta_Sans']">¡Cuenta creada con éxito!</h2>
              <p className="text-gray-500 mb-2">Bienvenido, <strong className="text-gray-800">{successData.nombre}</strong></p>
              <p className="text-sm text-gray-400 mb-8">Estamos preparando todo para ti...</p>
              <div className="flex justify-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 hidden lg:flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-soft" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative z-10 text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-full p-5 border border-emerald-200/30 backdrop-blur-xl shadow-2xl mb-6">
              <svg className="w-full h-full text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white font-['Plus_Jakarta_Sans'] mb-2">Redirigiendo...</h2>
            <p className="text-emerald-200/50">Serás redirigido automáticamente</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#081428] via-[#0c1f42] to-[#112a50]">
      <div className="flex-1 hidden lg:flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 text-center">
          <div className="mb-6 animate-float">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-3xl p-4 border border-white/10 backdrop-blur-xl shadow-2xl">
              <img src={logo} alt="Dron Salud" className="w-full h-full object-contain" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white font-['Plus_Jakarta_Sans'] mb-2">Nueva Cuenta</h2>
          <p className="text-blue-200/50">Únete a la red de logística inteligente</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
        <div className="relative z-10 w-full max-w-2xl animate-fade-in-up">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/20 p-8">
            <div className="lg:hidden flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-2xl p-3 border border-indigo-200/50 mb-3">
                <img src={logo} alt="Dron Salud" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Crear Cuenta</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              {errorMessage && (
                <div className="md:col-span-2 text-sm text-red-600 bg-red-50/80 border border-red-100 p-3 rounded-xl flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errorMessage}
                </div>
              )}

              <InputField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Juan" icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A9 9 0 0112 15c2.114 0 4.066.71 5.621 1.904M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )} />
              <InputField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Pérez" icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A9 9 0 0112 15c2.114 0 4.066.71 5.621 1.904M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )} />
              <InputField label="Cédula" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="12345678" icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="7" width="18" height="14" rx="2" ry="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 10h4M7 14h6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )} />
              <p className="md:col-span-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-1.5 -mt-2">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Verifica bien tu cédula antes de continuar. <strong>No podrás cambiarla después</strong>. Si te equivocas, tendrás que contactar a soporte para corregirla.</span>
              </p>
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="correo@dronesalud.com" icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )} />
              <InputField label="Teléfono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} placeholder="+56 9 1234 5678" icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 7.5A5.5 5.5 0 017.5 2h1A2.5 2.5 0 0111 4.5v1A5.5 5.5 0 015.5 11H4.5A2.5 2.5 0 012 8.5v-1z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 16.5A5.5 5.5 0 0016.5 22h-1A2.5 2.5 0 0113 19.5v-1A5.5 5.5 0 0118.5 13h1A2.5 2.5 0 0122 15.5v1z" />
                </svg>
              )} />
              <InputField label="Contraseña" name="password_hash" type="password" value={formData.password_hash} onChange={handleChange} placeholder="••••••••" icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )} />
              <InputField label="Confirmar Contraseña" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )} />

              <div className="md:col-span-2 pt-2">
                <SubmitButton loading={loading}>
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </SubmitButton>
              </div>

              <div className="md:col-span-2 text-center">
                <a href="#login" onClick={handleLoginRedirect} className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                  ¿Ya tienes cuenta? Ingresar
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
