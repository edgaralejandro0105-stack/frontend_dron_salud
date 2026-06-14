export default function Badge({ text }) {
  const styles = {
    'Disponible':    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Bajo stock':    'bg-amber-50 text-amber-700 border-amber-200',
    'Crítico':       'bg-rose-50 text-rose-600 border-rose-200',
    'En tránsito':   'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Entregado':     'bg-gray-100 text-gray-600 border-gray-200',
    'Preparando':    'bg-amber-50 text-amber-700 border-amber-200',
    'En vuelo':      'bg-sky-50 text-sky-700 border-sky-200',
    'Cargando':      'bg-amber-50 text-amber-700 border-amber-200',
    'Mantenimiento': 'bg-rose-50 text-rose-600 border-rose-200',
    'Pendiente': 'bg-amber-50 text-amber-700 border-amber-200',
    'Preparado': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Pagado': 'bg-blue-50 text-blue-700 border-blue-200',
  }
  return (
    <span className={`inline-block border rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${styles[text] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {text}
    </span>
  )
}
