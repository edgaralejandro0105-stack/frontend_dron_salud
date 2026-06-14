import { useState, useRef } from 'react'
import { fleetData as initialFleet } from '../../data/adminData'
import Badge from '../../components/ui/Badge'

const FLEET_KEY = 'dronSalud_fleet'

function loadFleet() {
  try {
    const saved = localStorage.getItem(FLEET_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return initialFleet
}

function saveFleet(drones) {
  localStorage.setItem(FLEET_KEY, JSON.stringify(drones))
}

const estados = ['Disponible', 'En vuelo', 'Cargando', 'Mantenimiento']

const statusColors = {
  'Disponible': 'bg-emerald-500',
  'En vuelo': 'bg-sky-500',
  'Cargando': 'bg-amber-500',
  'Mantenimiento': 'bg-rose-500',
}

export default function FleetPage() {
  const [drones, setDrones] = useState(loadFleet)
  const [modal, setModal] = useState(null)

  function handleSave(form) {
    let updated
    if (modal.mode === 'add') {
      updated = [...drones, { ...form }]
    } else {
      updated = drones.map(d => d.id === modal.drone.id ? { ...form } : d)
    }
    setDrones(updated)
    saveFleet(updated)
    setModal(null)
  }

  function handleDelete(id) {
    const updated = drones.filter(d => d.id !== id)
    setDrones(updated)
    saveFleet(updated)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.5 6.5l3-2.5v4l-3-1.5zM10 13l-4 2.5v-4l4 1.5zM20 11l-6 3.5v-4l6-1.5zM8 10l4 2.5v4l-4-2.5z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Flota de Drones</h2>
            <p className="text-xs text-gray-500 font-medium">{drones.length} drones registrados</p>
          </div>
        </div>
        <button
          onClick={() => setModal({ mode: 'add', drone: null })}
          className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.97] flex items-center gap-2"
        >
          <span className="text-base leading-none">+</span> Agregar Dron
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {drones.map((drone, i) => (
          <div
            key={drone.id}
            className="group bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)] hover:-translate-y-0.5 animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-48 h-48 sm:h-auto bg-gray-50 relative overflow-hidden shrink-0">
                {drone.foto ? (
                  <img src={drone.foto} alt={drone.modelo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <svg className="w-14 h-14 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.5 6.5l3-2.5v4l-3-1.5zM10 13l-4 2.5v-4l4 1.5zM20 11l-6 3.5v-4l6-1.5zM8 10l4 2.5v4l-4-2.5z" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Sin foto</span>
                  </div>
                )}
                <div className={`absolute top-3 left-3 w-2.5 h-2.5 rounded-full ${statusColors[drone.estado] || 'bg-gray-400'} shadow-[0_0_8px_rgba(0,0,0,0.15)]`} />
              </div>

              <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-gray-900 font-['Plus_Jakarta_Sans'] truncate">{drone.modelo}</h3>
                      <span className="text-xs text-gray-400 font-mono font-semibold">{drone.id}</span>
                    </div>
                    <Badge text={drone.estado} />
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs mt-4">
                    <div>
                      <span className="text-gray-400 font-semibold uppercase tracking-widest block mb-0.5">Matrícula</span>
                      <span className="text-gray-800 font-bold font-mono">{drone.matricula}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold uppercase tracking-widest block mb-0.5">Adquisición</span>
                      <span className="text-gray-800 font-semibold">{drone.fechaAdquisicion}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setModal({ mode: 'edit', drone })}
                    className="flex-1 text-[11px] font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 px-3 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.97] uppercase tracking-wider"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(drone.id)}
                    className="flex-1 text-[11px] font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 px-3 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.97] uppercase tracking-wider"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {drones.length === 0 && (
        <div className="text-center py-24 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.5 6.5l3-2.5v4l-3-1.5zM10 13l-4 2.5v-4l4 1.5zM20 11l-6 3.5v-4l6-1.5zM8 10l4 2.5v4l-4-2.5z" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <p className="text-base font-bold text-gray-500">No hay drones registrados</p>
          <p className="text-sm mt-1">Agrega el primer dron usando el botón superior</p>
        </div>
      )}

      {modal && (
        <DroneFormModal
          mode={modal.mode}
          drone={modal.drone}
          existingIds={drones.map(d => d.id)}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}

function DroneFormModal({ mode, drone, existingIds, onSave, onClose }) {
  const [id, setId] = useState(drone?.id || '')
  const [modelo, setModelo] = useState(drone?.modelo || '')
  const [matricula, setMatricula] = useState(drone?.matricula || '')
  const [fechaAdquisicion, setFechaAdquisicion] = useState(drone?.fechaAdquisicion || '')
  const [estado, setEstado] = useState(drone?.estado || 'Disponible')
  const [foto, setFoto] = useState(drone?.foto || '')
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setFoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!id.trim()) { setError('El ID del dron es obligatorio'); return }
    if (!modelo.trim()) { setError('El modelo del dron es obligatorio'); return }
    if (!matricula.trim()) { setError('La matrícula es obligatoria'); return }
    if (!fechaAdquisicion) { setError('La fecha de adquisición es obligatoria'); return }

    const trimmed = id.trim()
    if (mode === 'add' && existingIds.includes(trimmed)) {
      setError('Ya existe un dron con ese ID')
      return
    }
    if (mode === 'edit' && trimmed !== drone.id && existingIds.includes(trimmed)) {
      setError('Ya existe un dron con ese ID')
      return
    }

    onSave({ id: trimmed, modelo: modelo.trim(), matricula: matricula.trim(), fechaAdquisicion, estado, foto })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">
            {mode === 'add' ? 'Agregar Dron' : 'Editar Dron'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all text-lg">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-5 space-y-5">
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <div className="w-28 h-28 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center transition-all group-hover:border-sky-400 group-hover:bg-sky-50/30">
                {foto ? (
                  <img src={foto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] font-semibold text-gray-400 block mt-1">Foto</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 group-hover:bg-black/20 transition-all">
                <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-all drop-shadow-lg">+</span>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">ID del Dron</label>
              <input type="text" value={id} onChange={e => setId(e.target.value)} placeholder="Ej: DRN-99"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Estado</label>
              <select value={estado} onChange={e => setEstado(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500">
                {estados.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Modelo</label>
            <input type="text" value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ej: DJI Mavic 3 Enterprise"
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Matrícula</label>
              <input type="text" value={matricula} onChange={e => setMatricula(e.target.value)} placeholder="Ej: YV-312-DRN"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Fecha Adquisición</label>
              <input type="date" value={fechaAdquisicion} onChange={e => setFechaAdquisicion(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500" />
            </div>
          </div>

          {error && (
            <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-all duration-200">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.97]">
              {mode === 'add' ? 'Agregar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
