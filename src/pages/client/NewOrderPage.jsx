import { useState, useMemo, useEffect } from 'react'
import { getFarmacias, getProductos, createPedido, createPago } from '../../api'
import Badge from '../../components/ui/Badge'
import LocationPicker from '../../components/maps/LocationPicker'
import logo from '../../assets/Dron_Salud.png'

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const medicineColors = {
  1: 'bg-sky-400', 2: 'bg-sky-400', 3: 'bg-rose-400',
  4: 'bg-sky-400', 5: 'bg-sky-400', 6: 'bg-amber-400',
  7: 'bg-sky-400', 8: 'bg-sky-400', 9: 'bg-emerald-400',
  10: 'bg-sky-400',
}

function InvoiceModal({ cart, profile, onClose, onPlaceOrder }) {
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.product.precio) * item.qty, 0)
  const cargoDron = 5000
  const iva = Math.round(cartTotal * 0.16)
  const total = cartTotal + cargoDron + iva

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white rounded-t-3xl flex items-center justify-between p-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Resumen de compra</h3>
            <p className="text-xs text-slate-500 mt-0.5">Verifica los detalles antes de continuar</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {profile && (
            <div className="flex items-center gap-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-4 border border-sky-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                  {profile.nombre_comercial.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-base font-bold text-slate-800">{profile.nombre_comercial}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{profile.direccion}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{profile.telefono} · {profile.ciudad}</div>
                </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Productos ({cart.reduce((s, i) => s + i.qty, 0)})</span>
            </div>
            {cart.map((item, i) => (
              <div key={item.product.id_producto} className="flex items-center gap-4 bg-slate-50 rounded-xl p-3 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0">
                  {item.product.foto_url ? (
                    <img src={item.product.foto_url} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className={`w-5 h-5 rounded-full ${medicineColors[item.product.id_producto] || 'bg-slate-300'}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-800">{item.product.nombre} {item.product.concentracion}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.product.unidad_medida} · {item.qty} unidad{item.qty !== 1 ? 'es' : ''}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-slate-500">{formatCurrency(Number(item.product.precio) * item.qty)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-800">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-600">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Envío (dron)
              </span>
              <span className="font-semibold text-slate-800">{formatCurrency(cargoDron)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">IVA 16%</span>
              <span className="font-semibold text-slate-800">{formatCurrency(iva)}</span>
            </div>
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200">
              <span className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Total</span>
              <span className="text-base font-bold bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onPlaceOrder} className="flex-1 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.98]">
              Continuar al pago
            </button>
            <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3.5 rounded-2xl hover:bg-slate-50 transition-colors">
              Seguir editando
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SavedLocationsStep({ locations, onSelect, onNewLocation, onBack, onDelete }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 animate-scale-in">
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Dirección de entrega</h3>
              <p className="text-xs text-slate-500 mt-0.5">Elige dónde recibir tu pedido</p>
            </div>
            <button onClick={onBack} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {locations.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-semibold">No tienes direcciones guardadas</p>
              <p className="text-xs mt-1">Agrega una nueva en el mapa</p>
            </div>
          ) : locations.map((loc, i) => (
            <div key={i} className="relative group">
              <button
                onClick={() => onSelect(loc)}
                className="w-full text-left flex items-start gap-4 bg-slate-50 hover:bg-sky-50 rounded-2xl p-4 pr-12 border border-slate-100 hover:border-sky-200 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-800">{loc.nombre}</div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{loc.direccion}</div>
                </div>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(i) }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="p-6 pt-0">
          <button
            onClick={onNewLocation}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 font-semibold py-3.5 rounded-2xl transition-all bg-slate-50/50 hover:bg-blue-50/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva dirección en el mapa
          </button>
        </div>
      </div>
    </div>
  )
}

function PaymentModal({ cart, profile, user, onSuccess, onBack }) {
  const [step, setStep] = useState('form')
  const [error, setError] = useState('')

  const [mobileName, setMobileName] = useState('')
  const [mobilePhone, setMobilePhone] = useState('')
  const [mobileCI, setMobileCI] = useState('')
  const [mobileRef, setMobileRef] = useState('')

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.product.precio) * item.qty, 0)
  const cargoDron = 5000
  const iva = Math.round(cartTotal * 0.16)
  const total = cartTotal + cargoDron + iva

  const pagoMovil = profile ? {
    banco: profile.pago_movil_banco,
    telefono: profile.pago_movil_telefono,
    ci: profile.pago_movil_ci,
    titular: profile.pago_movil_titular,
  } : null

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!mobileName.trim()) { setError('Ingresa tu nombre'); return }
    if (mobileCI.replace(/\D/g, '').length < 5) { setError('Cédula de identidad inválida'); return }
    if (mobilePhone.replace(/\D/g, '').length < 7) { setError('Número telefónico inválido'); return }
    if (mobileRef.trim().length < 4) { setError('Número de referencia inválido'); return }

    setStep('processing')
    setTimeout(() => setStep('success'), 3000)
  }

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-10 text-center animate-scale-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-sky-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans'] mb-2">Verificando pago</h3>
          <p className="text-sm text-slate-500">La farmacia está confirmando tu transferencia...</p>
          <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-sky-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans'] mb-1">Pago confirmado</h3>
          <p className="text-xs text-slate-500 mb-6">Transferencia validada exitosamente</p>

          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-5 border border-sky-100 text-left space-y-3 mb-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Nombre</span>
              <span className="font-semibold text-slate-800">{mobileName || user?.nombre || '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Cédula</span>
              <span className="font-semibold text-slate-800 font-mono">{mobileCI || '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Teléfono</span>
              <span className="font-semibold text-slate-800 font-mono">{mobilePhone || '—'}</span>
            </div>
            <div className="border-t border-sky-100 pt-3 mt-3 flex items-center justify-between">
              <span className="text-slate-700 font-bold">Total pagado</span>
              <span className="font-bold text-blue-700">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onSuccess({ mobileName, mobileCI, mobilePhone, mobileRef })}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            >
              Ver seguimiento del envío
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={onBack}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Pago Móvil</h3>
              <p className="text-xs text-slate-500 mt-0.5">Transfiere directamente a la farmacia</p>
            </div>
            <button onClick={onBack} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-5 border border-sky-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {profile?.nombre_comercial?.charAt(0) || 'F'}
              </div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Transferir a {profile?.nombre_comercial || 'la farmacia'}</span>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-sky-100/50">
                <span className="text-slate-600">Banco</span>
                <span className="font-semibold text-slate-800">{pagoMovil?.banco || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-sky-100/50">
                <span className="text-slate-600">Teléfono</span>
                <span className="font-semibold text-slate-800">{pagoMovil?.telefono || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-sky-100/50">
                <span className="text-slate-600">C.I./RIF</span>
                <span className="font-semibold text-slate-800">{pagoMovil?.ci || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600">Beneficiario</span>
                <span className="font-semibold text-slate-800">{pagoMovil?.titular || '—'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-xs text-amber-800">Transfiere el <strong>monto exacto</strong> de <strong>{formatCurrency(total)}</strong> a los datos de Pago Móvil.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Nombre completo</label>
              <input type="text" value={mobileName} onChange={e => setMobileName(e.target.value)} placeholder="Tu nombre" className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-slate-50/50" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Cédula</label>
                <input type="text" value={mobileCI} onChange={e => setMobileCI(e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="12345678" className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono bg-slate-50/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Teléfono</label>
                <input type="text" value={mobilePhone} onChange={e => setMobilePhone(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="04121234567" className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono bg-slate-50/50" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Referencia de transferencia</label>
              <input type="text" value={mobileRef} onChange={e => setMobileRef(e.target.value.slice(0, 20))} placeholder="Ingresa la referencia" className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-slate-50/50" />
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatCurrency(cartTotal)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Envío (dron)</span><span>{formatCurrency(cargoDron)}</span></div>
              <div className="flex justify-between text-slate-600"><span>IVA 16%</span><span>{formatCurrency(iva)}</span></div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200">
                <span className="text-slate-900">Total</span>
                <span className="bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">{formatCurrency(total)}</span>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-50 rounded-xl p-3 font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl active:scale-[0.98] text-sm">
              Validar pago
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function DroneInstructions({ cart, profile, deliveryLocation, operator, user, paymentInfo, onBackToShop }) {
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.product.precio) * item.qty, 0)
  const cargoDron = 5000
  const iva = Math.round(cartTotal * 0.16)
  const granTotal = cartTotal + cargoDron + iva

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-start overflow-y-auto" style={{ background: 'linear-gradient(135deg, #0B1A30 0%, #0F2248 50%, #142D52 100%)' }}>
      <div className="w-full max-w-lg mx-auto text-center animate-fade-in py-8 px-4">
        <div className="mb-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl blur-2xl opacity-50" />
            <div className="relative bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-3 border border-white/20 shadow-xl">
              <img src={logo} alt="Dron Salud" className="w-14 h-14 object-contain" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white font-['Plus_Jakarta_Sans'] mb-1">¡Pedido confirmado!</h2>
        <p className="text-sky-200 text-sm mb-6">Tu dron está siendo preparado para el despegue</p>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 text-left mb-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-semibold text-sky-300 uppercase tracking-widest">Datos del cliente</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-sky-200">Nombre</span>
              <span className="font-semibold text-white">{user?.nombre || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sky-200">Cédula</span>
              <span className="font-semibold text-white font-mono">{paymentInfo?.mobileCI || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sky-200">Teléfono</span>
              <span className="font-semibold text-white font-mono">{paymentInfo?.mobilePhone || '—'}</span>
            </div>
            <div className="border-t border-white/10 pt-3 mt-3 flex items-center justify-between">
              <span className="text-sky-200 font-bold">Total pagado</span>
              <span className="font-bold text-emerald-400">{formatCurrency(granTotal)}</span>
            </div>
          </div>
        </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 text-left mb-4 relative">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-semibold text-sky-300 uppercase tracking-widest">Estado del envío</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-emerald-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Pago confirmado</div>
                  <div className="text-xs text-sky-200 mt-0.5">Transacción por {formatCurrency(granTotal)} aprobada</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold">01</div>
                <div>
                  <div className="text-sm font-bold text-white">Preparación del pedido</div>
                  <div className="text-xs text-sky-200 mt-0.5">La farmacia está preparando tus productos</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold">02</div>
                <div>
                  <div className="text-sm font-bold text-white">Despegue del dron</div>
                  <div className="text-xs text-sky-200 mt-0.5">El dron se dirige hacia tu ubicación</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold">03</div>
                <div>
                  <div className="text-sm font-bold text-white">Aléjate durante el descenso</div>
                  <div className="text-xs text-sky-200 mt-0.5">Mantén distancia de seguridad hasta que aterrice</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold">04</div>
                <div>
                  <div className="text-sm font-bold text-white">Retira tus productos</div>
                  <div className="text-xs text-sky-200 mt-0.5">Espera que apague motores y retira con seguridad</div>
                </div>
              </div>
            </div>
          </div>

        {operator && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 text-left mb-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-semibold text-sky-300 uppercase tracking-widest">Tu operador</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0 border-2 border-white/20">
                {operator.nombre.charAt(0)}
              </div>
              <div className="text-left min-w-0">
                <div className="text-sm font-bold text-white">{operator.nombre}</div>
                <div className="text-[10px] text-sky-300/70 mt-0.5">{operator.telefono}</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 text-left mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs font-semibold text-sky-300 uppercase tracking-widest">Pedido</span>
            </div>
            <span className="text-xs text-sky-300">{cart.reduce((s, i) => s + i.qty, 0)} producto{cart.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {cart.map((item) => (
              <div key={item.product.id_producto} className="flex justify-between text-sky-100 gap-2">
                <span className="text-left truncate">{item.product.nombre} {item.product.concentracion} x{item.qty}</span>
                <span className="font-semibold text-white flex-shrink-0">{formatCurrency(Number(item.product.precio) * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-3 pt-3 flex justify-between text-sm">
            <span className="font-bold text-white">Total pagado</span>
            <span className="font-bold text-emerald-400">{formatCurrency(granTotal)}</span>
          </div>
        </div>

        {profile && (
          <div className="text-[10px] text-sky-300 mb-1">
            Origen: {profile.nombre_comercial} · {profile.direccion}
          </div>
        )}
        {deliveryLocation && (
          <div className="text-[10px] text-sky-300 mb-6">
            Destino: {deliveryLocation.direccion || deliveryLocation.address}
          </div>
        )}

        <button
          onClick={onBackToShop}
          className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20 active:scale-[0.98]"
        >
          Volver a la tienda
        </button>
      </div>
    </div>
  )
}

function ProductCard({ product, inCart, stockOk, onAdd }) {
  const [qty, setQty] = useState(1)
  const stock = Number(product.stock_actual) || 0
  const cond = stock > 100 ? 'text-emerald-600' : stock > 20 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 p-3 hover:border-sky-200 hover:shadow-[0_8px_30px_rgba(14,165,233,0.1)] transition-all duration-300 flex flex-col">
      <div className="w-full h-32 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center mb-3 overflow-hidden relative">
        {product.foto_url ? (
          <img src={product.foto_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-[9px] text-slate-400 font-medium">{product.categoria}</span>
          </div>
        )}
        <div className="absolute top-1.5 right-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
            {stock > 0 ? 'Disponible' : 'Sin stock'}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <h4 className="text-xs font-bold text-slate-800 leading-tight mb-0.5">
          {product.nombre} {product.concentracion}
        </h4>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">{product.unidad_medida}</span>
          <span className={`text-[10px] font-semibold ${cond}`}>
            Stock: {stock.toLocaleString()}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mb-2 line-clamp-2 leading-relaxed">
          {product.especificaciones}
        </p>
        <div className="text-base font-bold bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent mb-2">
          {formatCurrency(Number(product.precio))}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors text-sm font-bold"
          >−</button>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-9 h-8 text-center text-xs font-bold text-slate-800 bg-transparent border-x border-slate-200 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={() => setQty(qty + 1)}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors text-sm font-bold"
          >+</button>
        </div>
        <button
          onClick={() => { onAdd(product, qty); setQty(1) }}
          disabled={!stockOk}
          className={`flex-1 h-8 rounded-xl text-[10px] font-bold transition-all duration-200 ${
            inCart
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : stockOk
                ? 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg active:scale-[0.97]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {!stockOk ? 'Sin stock' : inCart ? `✓ ${inCart.qty + qty}` : 'Agregar'}
        </button>
      </div>
    </div>
  )
}

const STORAGE_KEY = 'dronSalud_savedLocations'

function loadSavedLocations() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

function saveLocationToStorage(locations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locations))
}

export default function NewOrderPage({ user }) {
  const [farmacias, setFarmacias] = useState([])
  const [selectedPharmacy, setSelectedPharmacy] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [cart, setCart] = useState([])
  const [showInvoice, setShowInvoice] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [showSavedLocations, setShowSavedLocations] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showDroneInstructions, setShowDroneInstructions] = useState(false)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [paymentInfo, setPaymentInfo] = useState({})
  const [savedLocations, setSavedLocations] = useState(loadSavedLocations)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('todos')
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    getFarmacias().then(setFarmacias).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedPharmacy) {
      setLoadingCatalog(true)
      getProductos({ id_farmacia: selectedPharmacy.id_farmacia })
        .then(setCatalog)
        .catch(() => setCatalog([]))
        .finally(() => setLoadingCatalog(false))
    } else {
      setCatalog([])
    }
  }, [selectedPharmacy])

  const categorias = useMemo(() => {
    const cats = new Set(catalog.map(p => p.categoria).filter(Boolean))
    return ['todos', ...Array.from(cats).sort()]
  }, [catalog])

  const filteredCatalog = useMemo(() => {
    let items = catalog
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.concentracion.toLowerCase().includes(q) ||
        p.especificaciones.toLowerCase().includes(q)
      )
    }
    if (filterCategoria !== 'todos') {
      items = items.filter(p => p.categoria === filterCategoria)
    }
    return items
  }, [catalog, searchQuery, filterCategoria])

  const profile = selectedPharmacy
    ? farmacias.find(p => p.id_farmacia === selectedPharmacy.id_farmacia)
    : null

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.product.precio) * item.qty, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const stockOk = (item) => Number(item.stock_actual) > 0

  function addToCart(product, qty) {
    if (qty < 1) return
    setCart(prev => {
      const exist = prev.find(c => c.product.id_producto === product.id_producto)
      if (exist) {
        return prev.map(c =>
          c.product.id_producto === product.id_producto ? { ...c, qty: c.qty + qty } : c
        )
      }
      return [...prev, { product, qty }]
    })
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(c => c.product.id_producto !== productId))
  }

  function updateQty(productId, qty) {
    if (qty < 1) { removeFromCart(productId); return }
    setCart(prev =>
      prev.map(c => (c.product.id_producto === productId ? { ...c, qty } : c))
    )
  }

  function placeOrder() {
    setShowInvoice(false)
    if (savedLocations.length > 0) {
      setShowSavedLocations(true)
    } else {
      setShowLocationPicker(true)
    }
  }

  function handleSavedLocationSelect(location) {
    setDeliveryLocation(location)
    setShowSavedLocations(false)
    setShowPayment(true)
  }

  function handleNewLocation() {
    setShowSavedLocations(false)
    setShowLocationPicker(true)
  }

  function handleLocationConfirm(location) {
    setDeliveryLocation(location)
    setShowLocationPicker(false)
    const exists = savedLocations.some(
      l => l.lat === location.lat && l.lng === location.lng
    )
    if (!exists && location.direccion) {
      const name = location.direccion.split(',')[0].trim()
      const newLoc = {
        nombre: name.length > 20 ? name.slice(0, 20) + '...' : name,
        direccion: location.direccion || location.address,
        lat: location.lat,
        lng: location.lng,
      }
      const updated = [...savedLocations, newLoc]
      setSavedLocations(updated)
      saveLocationToStorage(updated)
    }
    setShowPayment(true)
  }

  function handleLocationBack() {
    setShowLocationPicker(false)
    setShowInvoice(true)
  }

  async function handlePaymentSuccess(paymentInfo = {}) {
    setPaymentInfo(paymentInfo)

    const cartTotal = cart.reduce((sum, item) => sum + Number(item.product.precio) * item.qty, 0)
    const cargoDron = 5000
    const iva = Math.round(cartTotal * 0.16)

    try {
      const pedido = await createPedido({
        id_farmacia: selectedPharmacy.id_farmacia,
        subtotal: cartTotal,
        cargo_dron: cargoDron,
        iva: iva,
        total: cartTotal + cargoDron + iva,
        destino_nombre: deliveryLocation.nombre || (deliveryLocation.address ? deliveryLocation.address.split(',')[0] : 'Dirección'),
        destino_direccion: deliveryLocation.direccion || deliveryLocation.address || '',
        latitud_entrega: String(deliveryLocation.lat),
        longitud_entrega: String(deliveryLocation.lng),
        productos: cart.map(item => ({
          id_producto: item.product.id_producto,
          nombre_producto: item.product.nombre + ' ' + (item.product.concentracion || ''),
          cantidad: item.qty,
          precio_unitario: Number(item.product.precio),
        })),
      })

      await createPago({
        id_pedido: pedido.id_pedido,
        id_farmacia: selectedPharmacy.id_farmacia,
        metodo: 'PagoMovil',
        monto: pedido.total,
        referencia: paymentInfo.mobileRef || '',
      })
    } catch (err) {
      console.error('Error al crear pedido:', err)
    }

    setShowPayment(false)
    setShowDroneInstructions(true)
  }

  function handlePaymentBack() {
    setShowPayment(false)
    if (savedLocations.length > 0) {
      setShowSavedLocations(true)
    } else {
      setShowLocationPicker(true)
    }
  }

  function handleDeleteLocation(index) {
    const updated = savedLocations.filter((_, i) => i !== index)
    setSavedLocations(updated)
    saveLocationToStorage(updated)
  }

  function backToShop() {
    setShowDroneInstructions(false)
    setSelectedPharmacy(null)
    setCart([])
    setDeliveryLocation(null)
    setSearchQuery('')
    setFilterCategoria('todos')
  }

  if (!selectedPharmacy) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <div className="relative inline-flex mb-3">
            <img src={logo} alt="Dron Salud" className="w-28 h-28 sm:w-32 sm:h-32 object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans'] mb-1">
            ¿Qué farmacia te queda más cerca?
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Selecciona una farmacia para ver su catálogo de medicamentos y recibirlos vía dron
          </p>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {farmacias.map(p => (
            <button
              key={p.id_farmacia}
              onClick={() => setSelectedPharmacy(p)}
              className="group relative bg-white rounded-3xl border border-slate-100 overflow-hidden hover:border-sky-200 hover:shadow-[0_12px_40px_rgba(14,165,233,0.12)] transition-all duration-500 text-left"
            >
              <div className="h-48 bg-gradient-to-br from-sky-500 to-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-blue-600/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
                    <span className="text-xl font-bold bg-gradient-to-br from-sky-600 to-blue-700 bg-clip-text text-transparent">{p.nombre_comercial.charAt(0)}</span>
                  </div>
                  <div className="text-white min-w-0">
                    <div className="text-base font-bold truncate">{p.nombre_comercial}</div>
                    <div className="text-xs text-white/70 truncate">{p.ciudad}</div>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="line-clamp-1">{p.direccion}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{p.telefono}</span>
                </div>
                <div className="pt-1">
                  <span className="text-xs font-semibold text-sky-600 group-hover:text-sky-800 transition-colors inline-flex items-center gap-1">
                    Explorar catálogo
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-6">
        <div className="flex-1 min-w-0">
          <div className="bg-white border-b border-slate-100 lg:border lg:rounded-2xl lg:shadow-sm lg:m-6 lg:mb-4 px-4 lg:px-5 py-3 lg:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => { setSelectedPharmacy(null); setCart([]); setDeliveryLocation(null); setCartOpen(false) }}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                  {profile.nombre_comercial.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800 truncate">{profile.nombre_comercial}</div>
                  <div className="text-xs text-slate-500 truncate">{profile.direccion}</div>
                </div>
              </div>
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="lg:hidden relative w-10 h-10 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="px-4 lg:px-6 pb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar medicamento..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 transition-all duration-200 text-sm"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategoria(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    filterCategoria === cat
                      ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-600'
                  }`}
                >
                  {cat === 'todos' ? 'Todos' : cat}
                </button>
              ))}
            </div>
          </div>

          {filteredCatalog.length === 0 ? (
            <div className="text-center py-16 text-slate-400 px-4">
              <svg className="w-14 h-14 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm font-semibold">No se encontraron medicamentos</p>
              <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
            </div>
          ) : (
            <div className="px-4 lg:px-6 pb-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCatalog.map(product => {
                const inCart = cart.find(c => c.product.id_producto === product.id_producto)
                return (
                  <ProductCard
                    key={product.id_producto}
                    product={product}
                    inCart={inCart}
                    stockOk={stockOk(product)}
                    onAdd={addToCart}
                  />
                )
              })}
            </div>
          )}
        </div>

        <div className={`fixed inset-0 z-40 lg:static lg:z-auto ${cartOpen ? 'block' : 'hidden lg:block'}`}>
          {cartOpen && (
            <div className="fixed inset-0 bg-slate-900/30 lg:hidden" onClick={() => setCartOpen(false)} />
          )}
          <div className={`fixed right-0 top-0 bottom-0 w-80 bg-white lg:static lg:w-80 flex-shrink-0 lg:sticky lg:top-6 lg:mr-6 lg:mb-6 lg:h-fit lg:rounded-3xl lg:border lg:border-slate-100 lg:shadow-sm overflow-y-auto ${cartOpen ? 'block' : 'hidden'} lg:block z-50 shadow-2xl lg:shadow-none`}>
            <div className="p-5 lg:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">Carrito</h3>
                </div>
                <div className="flex items-center gap-2">
                  {cartCount > 0 && (
                    <span className="bg-gradient-to-r from-sky-600 to-blue-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                  <button onClick={() => setCartOpen(false)} className="lg:hidden w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {showDroneInstructions ? (
                <div className="text-center py-10">
                  <svg className="w-12 h-12 mx-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-bold text-slate-800 mt-3">Pedido realizado</p>
                  <p className="text-xs text-slate-500 mt-1">Tu pedido está en proceso</p>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <svg className="w-12 h-12 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  <p className="text-xs mt-2 font-semibold">Carrito vacío</p>
                  <p className="text-xs">Agrega productos del catálogo</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-1">
                    {cart.map(item => (
                      <div key={item.product.id_producto} className="bg-slate-50 rounded-xl p-3">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.product.foto_url ? (
                              <img src={item.product.foto_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-5 h-5 rounded-full ${medicineColors[item.product.id_producto] || 'bg-slate-300'}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="text-xs font-bold text-slate-800 leading-tight pr-1">
                                {item.product.nombre} {item.product.concentracion}
                              </div>
                              <button
                                onClick={() => removeFromCart(item.product.id_producto)}
                                className="text-slate-400 hover:text-red-500 transition-colors shrink-0 ml-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.product.unidad_medida}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQty(item.product.id_producto, item.qty - 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                            >−</button>
                            <span className="w-8 text-center text-sm font-bold text-slate-800">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.product.id_producto, item.qty + 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                            >+</button>
                          </div>
                          <div className="text-xs font-bold text-slate-800">
                            {formatCurrency(Number(item.product.precio) * item.qty)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 mt-4 pt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-bold text-slate-800">{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Items</span>
                      <span>{cartCount} unidad{cartCount !== 1 ? 'es' : ''}</span>
                    </div>
                    <button
                      onClick={() => setShowInvoice(true)}
                      className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold py-3 rounded-2xl transition-all duration-200 text-sm mt-2 shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.98]"
                    >
                      Ir a pagar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showInvoice && (
        <InvoiceModal
          cart={cart}
          profile={profile}
          onClose={() => setShowInvoice(false)}
          onPlaceOrder={placeOrder}
        />
      )}

      {showSavedLocations && (
        <SavedLocationsStep
          locations={savedLocations}
          onSelect={handleSavedLocationSelect}
          onNewLocation={handleNewLocation}
          onDelete={handleDeleteLocation}
          onBack={() => { setShowSavedLocations(false); setShowInvoice(true) }}
        />
      )}

      {showLocationPicker && (
        <LocationPicker
          onConfirm={handleLocationConfirm}
          onBack={handleLocationBack}
          pharmacyLocation={profile ? { lat: profile.lat, lng: profile.lng } : null}
        />
      )}

      {showPayment && (
        <PaymentModal
          cart={cart}
          profile={profile}
          user={user}
          deliveryLocation={deliveryLocation}
          onSuccess={handlePaymentSuccess}
          onBack={handlePaymentBack}
        />
      )}

      {showDroneInstructions && (
        <DroneInstructions
          cart={cart}
          profile={profile}
          user={user}
          paymentInfo={paymentInfo}
          deliveryLocation={deliveryLocation}
          operator={operatorProfile}
          onBackToShop={backToShop}
        />
      )}
    </>
  )
}
