import { fleetData } from '../../data/adminData'
import Badge from '../../components/ui/Badge'

export default function FleetPage() {
  return (
    <>
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {fleetData.map((drone, i) => (
          <div key={drone.id} className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${drone.estado === 'En vuelo' ? 'bg-sky-50' : drone.estado === 'Disponible' ? 'bg-emerald-50' : drone.estado === 'Mantenimiento' ? 'bg-rose-50' : 'bg-amber-50'}`}>
                  🚁
                </div>
                <span className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">{drone.id}</span>
              </div>
              <Badge text={drone.estado} />
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Batería</div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${drone.bateria > 50 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : drone.bateria > 20 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`}
                    style={{ width: `${drone.bateria}%` }}
                  />
                </div>
                <div className="text-xs font-bold text-gray-700 mt-1.5">{drone.bateria}%</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Ubicación</div>
                <div className="text-sm font-semibold text-gray-800 mt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <span>📍</span>
                    {drone.ubicacion}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
