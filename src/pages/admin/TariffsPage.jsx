import { useState, useEffect } from 'react'
import { getConfiguraciones, updateConfiguracion } from '../../api'

const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition-all duration-200 text-sm'
const labelClass = 'text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block'

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function TariffsPage() {
  const [configs, setConfigs] = useState([])
  const [editing, setEditing] = useState(null)
  const [editValor, setEditValor] = useState('')
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    loadConfigs()
  }, [])

  function loadConfigs() {
    getConfiguraciones().then(data => {
      if (Array.isArray(data)) setConfigs(data)
    }).catch(() => {})
  }

  function showMsg(text) {
    setMsg(text)
    setTimeout(() => setMsg(null), 4000)
  }

  function startEdit(c) {
    setEditing(c)
    setEditValor(c.valor)
  }

  async function saveEdit() {
    if (!editing) return
    if (!editValor || isNaN(Number(editValor)) || Number(editValor) < 0) {
      showMsg('Ingresa un valor numerico valido')
      return
    }
    try {
      await updateConfiguracion(editing.clave, editValor, editing.descripcion)
      showMsg(`Tarifa "${editing.clave}" actualizada a ${formatCurrency(editValor)}`)
      setEditing(null)
      loadConfigs()
    } catch (err) {
      showMsg('Error: ' + (err?.response?.data?.message || 'Error al actualizar'))
    }
  }

  const cargoDron = configs.find(c => c.clave === 'cargo_dron')

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-2xl px-5 py-3.5 mb-6 text-center shadow-sm animate-fade-in">
          {msg}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-8 mb-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-sky-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Tarifas de envio</h3>
            <p className="text-sm text-gray-400 mt-0.5">Configura el costo fijo del servicio de entrega con dron</p>
          </div>
        </div>

        {cargoDron && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans'] capitalize">{cargoDron.clave.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-gray-500">{cargoDron.descripcion}</p>
                {cargoDron.fecha_actualizacion && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ultima modificación: {new Date(cargoDron.fecha_actualizacion).toLocaleString('es-VE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent font-['Plus_Jakarta_Sans']">
                  {formatCurrency(cargoDron.valor)}
                </div>
                <button
                  onClick={() => startEdit(cargoDron)}
                  className="mt-2 text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors inline-flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar tarifa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Editar tarifa</h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>{editing.clave.replace(/_/g, ' ')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">Bs.</span>
                  <input
                    type="number"
                    min="0"
                    value={editValor}
                    onChange={e => setEditValor(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition-all duration-200 text-sm font-bold"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{editing.descripcion}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
                  Cancelar
                </button>
                <button onClick={saveEdit} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 hover:shadow-xl active:scale-[0.98] transition-all">
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
