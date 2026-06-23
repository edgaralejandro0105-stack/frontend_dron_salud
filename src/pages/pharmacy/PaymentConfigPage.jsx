import { useState, useEffect } from 'react'
import { getFarmacia, updateMyFarmacia } from '../../api'

const banks = [
  'Banco de Venezuela', 'Banco Mercantil', 'Banco Provincial', 'Banco Nacional de Crédito',
  'Banco Banesco', 'Banco Occidental de Descuento', 'Banco Exterior',
  'Banco del Tesoro', 'Banco Sofitasa', 'Banco Caroní', '100% Banco',
]

export default function PaymentConfigPage({ user }) {
  const farmaciaId = user?.id_farmacia
  const [profile, setProfile] = useState(null)
  const [banco, setBanco] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ci, setCi] = useState('')
  const [titular, setTitular] = useState('')
  const [saved, setSaved] = useState(false)
  const [copyMsg, setCopyMsg] = useState('')

  useEffect(() => {
    if (!farmaciaId) return
    getFarmacia(farmaciaId).then(f => {
      setProfile(f)
      setBanco(f.pago_movil_banco || '')
      setTelefono(f.pago_movil_telefono || '')
      setCi(f.pago_movil_ci || '')
      setTitular(f.pago_movil_titular || f.nombre_comercial || '')
    }).catch(() => {})
  }, [farmaciaId])

  async function handleSave() {
    try {
      await updateMyFarmacia({
        pago_movil_banco: banco,
        pago_movil_telefono: telefono,
        pago_movil_ci: ci,
        pago_movil_titular: titular,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Error al guardar')
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    setCopyMsg('¡Copiado!')
    setTimeout(() => setCopyMsg(''), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Configuración de Pago</h2>
        <p className="text-sm text-gray-500 mt-1">Registra tu cuenta de Pago Móvil para recibir transferencias de tus clientes</p>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt={profile.nombre_comercial} className="w-full h-full object-contain" />
            ) : (
              profile?.nombre_comercial?.charAt(0) || 'F'
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800">{profile?.nombre_comercial || 'Mi Farmacia'}</div>
            <div className="text-xs text-gray-500">Datos de cobro Pago Móvil</div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Banco</label>
          <select value={banco} onChange={e => setBanco(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white">
            <option value="">Selecciona tu banco</option>
            {banks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Teléfono registrado en Pago Móvil</label>
          <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="0412-3456789" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Cédula / RIF</label>
          <input type="text" value={ci} onChange={e => setCi(e.target.value)} placeholder="J-12345678-9" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Titular de la cuenta</label>
          <input type="text" value={titular} onChange={e => setTitular(e.target.value)} placeholder="Nombre del titular" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
        </div>

        <button onClick={handleSave} className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 active:scale-[0.97] text-sm">
          {saved ? '✓ Datos guardados' : 'Guardar datos bancarios'}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans'] mb-4">Vista previa — lo que verán tus clientes</h3>
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-5 border border-blue-200">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Transferir a</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Banco</span>
              <span className="font-semibold text-gray-800">{banco || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Teléfono</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">{telefono || '—'}</span>
                {telefono && (
                  <button onClick={() => copyToClipboard(telefono)} className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold">
                    {copyMsg || 'Copiar'}
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">C.I./RIF</span>
              <span className="font-semibold text-gray-800">{ci || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Beneficiario</span>
              <span className="font-semibold text-gray-800">{titular || '—'}</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
          El cliente verá estos datos al momento de pagar. El pago llega directamente a tu cuenta y luego la plataforma te indicará cómo transferir a DronSalud.
        </p>
      </div>
    </div>
  )
}
