import React, { useState } from 'react'
import logo from '../assets/Dron_Salud.png'

function RegisterHeader() {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      <img src={logo} alt="Dron Salud" className="w-80 h-52 object-contain mb-4" />
      <div className="text-sm text-blue-600">Logística Médica Inteligente</div>
      <h2 className="text-lg font-semibold text-gray-800 mt-6">Crear una Cuenta Nueva</h2>
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

function SelectField({ label, name, value, onChange, options, icon = null }) {
  return (
    <label className="w-full">
      <div className="text-xs font-semibold text-gray-600 mb-1">{label}</div>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-8 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white appearance-none`}
        >
          <option value="">Selecciona tipo de usuario</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </label>
  )
}

function SubmitButton({ children, loading = false }) {
  return (
    <button
      type="submit"
      className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-md transition-colors disabled:opacity-60"
      disabled={loading}
    >
      {children}
    </button>
  )
}

export default function RegisterFormView({ onBackToLogin }) {
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (formData.password_hash !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.')
      return
    }

    const payload = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      cedula: formData.cedula.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono.trim(),
      password_hash: formData.password_hash,
    }

    console.log('Registro de cuenta listo para enviar:', payload)

    // Aquí iría la petición POST al backend para crear la cuenta:
    // setLoading(true)
    // try {
    //   const response = await fetch('/api/register', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(payload),
    //   })
    //   const result = await response.json()
    //   // manejar respuesta...
    // } catch (error) {
    //   setErrorMessage('Error al registrar la cuenta.')
    // } finally {
    //   setLoading(false)
    // }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Cuenta creada con éxito (simulación).')
    }, 800)
  }

  const handleLoginRedirect = (e) => {
    e.preventDefault()
    if (onBackToLogin) {
      onBackToLogin()
      return
    }
    console.log('Navegar a login (simulado).')
    alert('Volver al login (simulado).')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <RegisterHeader />

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          {errorMessage && (
            <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded">
              {errorMessage}
            </div>
          )}

          <div>
            <InputField
              label="NOMBRE"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Juan"
              icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9 9 0 0112 15c2.114 0 4.066.71 5.621 1.904M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            />
          </div>

          <div>
            <InputField
              label="APELLIDO"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Pérez"
              icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9 9 0 0112 15c2.114 0 4.066.71 5.621 1.904M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            />
          </div>

          <div>
            <InputField
              label="CÉDULA"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              placeholder="12345678"
              icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="7" width="18" height="14" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 10h4M7 14h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            />
          </div>

          <div>
            <InputField
              label="EMAIL"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@dronesalud.com"
              icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            />
          </div>

          <div>
            <InputField
              label="TELÉFONO"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+56 9 1234 5678"
              icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 7.5A5.5 5.5 0 017.5 2h1A2.5 2.5 0 0111 4.5v1A5.5 5.5 0 015.5 11H4.5A2.5 2.5 0 012 8.5v-1z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 16.5A5.5 5.5 0 0016.5 22h-1A2.5 2.5 0 0113 19.5v-1A5.5 5.5 0 0118.5 13h1A2.5 2.5 0 0122 15.5v1z" />
                </svg>
              )}
            />
          </div>

          <div>
            <InputField
              label="CONTRASEÑA"
              name="password_hash"
              type="password"
              value={formData.password_hash}
              onChange={handleChange}
              placeholder="••••••••"
              icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            />
          </div>

          <div>
            <InputField
              label="CONFIRMAR CONTRASEÑA"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              icon={(
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <SubmitButton loading={loading}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </SubmitButton>
          </div>

          <div className="md:col-span-2 text-center mt-2">
            <a href="#login" onClick={handleLoginRedirect} className="text-sm text-blue-700 hover:underline font-semibold">
              ¿Ya tienes cuenta? Ingresar
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
