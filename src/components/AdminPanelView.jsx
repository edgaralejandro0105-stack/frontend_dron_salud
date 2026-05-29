import React, { useState } from 'react'
import logo from '../assets/Dron_Salud.png'

// ─── Chart Data ───────────────────────────────────────────────────────────────
const monthlyData = [
  { name: 'Ene', envios: 1200 },
  { name: 'Feb', envios: 1900 },
  { name: 'Mar', envios: 1500 },
  { name: 'Abr', envios: 2200 },
  { name: 'May', envios: 2800 },
  { name: 'Jun', envios: 2500 },
]

const pharmaciesData = [
  { name: 'F.Cent', pedidos: 850 },
  { name: 'S.Plus', pedidos: 620 },
  { name: 'BioM',   pedidos: 540 },
  { name: 'MediC',  pedidos: 490 },
  { name: 'CruzV',  pedidos: 380 },
]

const inventoryData = [
  { id: 'MED-001', nombre: 'Ibuprofeno 400mg',  stock: 1240, estado: 'Disponible' },
  { id: 'MED-002', nombre: 'Amoxicilina 500mg', stock: 860,  estado: 'Disponible' },
  { id: 'MED-003', nombre: 'Insulina NPH',      stock: 45,   estado: 'Bajo stock' },
  { id: 'MED-004', nombre: 'Paracetamol 500mg', stock: 2100, estado: 'Disponible' },
  { id: 'MED-005', nombre: 'Losartán 50mg',     stock: 320,  estado: 'Disponible' },
  { id: 'MED-006', nombre: 'Omeprazol 20mg',    stock: 18,   estado: 'Crítico' },
]

const ordersData = [
  { id: 'ORD-3901', farmacia: 'FarmaCentral',  items: 12, estado: 'En tránsito',  dron: 'DRN-07' },
  { id: 'ORD-3900', farmacia: 'SaludPlus',     items: 5,  estado: 'Entregado',    dron: 'DRN-12' },
  { id: 'ORD-3899', farmacia: 'BioMedic',      items: 8,  estado: 'Preparando',   dron: '—' },
  { id: 'ORD-3898', farmacia: 'MediCare',      items: 3,  estado: 'Entregado',    dron: 'DRN-03' },
  { id: 'ORD-3897', farmacia: 'CruzVerde',     items: 15, estado: 'En tránsito',  dron: 'DRN-21' },
]

const fleetData = [
  { id: 'DRN-03', bateria: 92, estado: 'En vuelo',    ubicacion: 'Zona Norte' },
  { id: 'DRN-07', bateria: 78, estado: 'En vuelo',    ubicacion: 'Centro' },
  { id: 'DRN-12', bateria: 45, estado: 'Cargando',    ubicacion: 'Base' },
  { id: 'DRN-15', bateria: 100, estado: 'Disponible', ubicacion: 'Base' },
  { id: 'DRN-21', bateria: 65, estado: 'En vuelo',    ubicacion: 'Zona Sur' },
  { id: 'DRN-28', bateria: 12, estado: 'Mantenimiento', ubicacion: 'Taller' },
]

// ─── Area Chart (SVG puro) ────────────────────────────────────────────────────
function AreaChartSVG({ data, dataKey }) {
  const W = 600, H = 260, padL = 50, padR = 20, padT = 20, padB = 40
  const maxVal = Math.max(...data.map(d => d[dataKey]))
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const xs = data.map((_, i) => padL + (i / (data.length - 1)) * chartW)
  const ys = data.map(d => padT + (1 - d[dataKey] / maxVal) * chartH)

  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ')
  const areaPath = `${linePath} L${xs[xs.length - 1]},${H - padB} L${xs[0]},${H - padB} Z`

  const [hover, setHover] = useState(null)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = padT + t * chartH
        return <line key={i} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
      })}

      {/* Y labels */}
      {[0, 0.5, 1].map((t, i) => {
        const y = padT + t * chartH
        const val = Math.round(maxVal * (1 - t))
        return <text key={i} x={padL - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#6b7280">{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}</text>
      })}

      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={xs[i]} y={H - 6} textAnchor="middle" fontSize="11" fill="#6b7280">{d.name}</text>
      ))}

      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {data.map((d, i) => (
        <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
          <circle cx={xs[i]} cy={ys[i]} r="14" fill="transparent" />
          <circle cx={xs[i]} cy={ys[i]} r={hover === i ? 6 : 4} fill={hover === i ? '#1e3a8a' : '#fff'} stroke="#1e3a8a" strokeWidth="2.5" />
          {hover === i && (
            <g>
              <rect x={xs[i] - 34} y={ys[i] - 36} width="68" height="26" rx="6" fill="#1e3a8a" />
              <text x={xs[i]} y={ys[i] - 18} textAnchor="middle" fontSize="12" fontWeight="600" fill="#fff">{d[dataKey].toLocaleString()}</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  )
}

// ─── Bar Chart (SVG puro) ─────────────────────────────────────────────────────
function BarChartSVG({ data, dataKey }) {
  const W = 400, H = 260, padL = 50, padR = 20, padT = 20, padB = 40
  const maxVal = Math.max(...data.map(d => d[dataKey]))
  const chartH = H - padT - padB
  const barW = 32
  const gap = (W - padL - padR - data.length * barW) / (data.length + 1)
  const blues = ['#1e3a8a', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa']

  const [hover, setHover] = useState(null)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = padT + t * chartH
        return <line key={i} x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
      })}

      {[0, 0.5, 1].map((t, i) => {
        const y = padT + t * chartH
        const val = Math.round(maxVal * (1 - t))
        return <text key={i} x={padL - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#6b7280">{val}</text>
      })}

      {data.map((d, i) => {
        const barH = (d[dataKey] / maxVal) * chartH
        const x = padL + gap + i * (barW + gap)
        const y = padT + chartH - barH
        return (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
            <rect x={x} y={y} width={barW} height={barH} rx="5" fill={hover === i ? '#1e3a8a' : blues[i]} opacity={hover === i ? 1 : 0.85} />
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#6b7280">{d.name}</text>
            {hover === i && (
              <g>
                <rect x={x + barW / 2 - 26} y={y - 32} width="52" height="24" rx="6" fill="#1e3a8a" />
                <text x={x + barW / 2} y={y - 15} textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">{d[dataKey]}</text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ─── Sidebar Item ─────────────────────────────────────────────────────────────
function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-semibold transition-colors ${
        active
          ? 'bg-blue-800 text-white'
          : 'text-gray-300 hover:bg-blue-800/50 hover:text-white'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function Badge({ text }) {
  const styles = {
    'Disponible':    'bg-blue-50 text-blue-700 border-blue-200',
    'Bajo stock':    'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Crítico':       'bg-red-50 text-red-600 border-red-200',
    'En tránsito':   'bg-blue-50 text-blue-700 border-blue-200',
    'Entregado':     'bg-gray-100 text-gray-600 border-gray-200',
    'Preparando':    'bg-yellow-50 text-yellow-700 border-yellow-200',
    'En vuelo':      'bg-blue-50 text-blue-700 border-blue-200',
    'Cargando':      'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Mantenimiento': 'bg-red-50 text-red-600 border-red-200',
  }
  return (
    <span className={`inline-block border rounded-full px-3 py-1 text-xs font-semibold ${styles[text] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {text}
    </span>
  )
}

// ─── Module: Dashboard ────────────────────────────────────────────────────────
function DashboardModule() {
  return (
    <>
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mb-8">
        {/* Metric cards */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 flex flex-col justify-between min-h-[180px]">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-4">Total de Ventas</div>
          <div className="text-4xl font-bold text-gray-800">$1.24M</div>
          <div className="mt-3"><span className="bg-blue-50 text-blue-700 text-xs font-semibold rounded-full px-3 py-1">+12.5% este mes</span></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 flex flex-col justify-between min-h-[180px]">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-4">Drones Activos</div>
          <div className="text-4xl font-bold text-gray-800">42 / 50</div>
          <div className="mt-3"><span className="bg-blue-50 text-blue-700 text-xs font-semibold rounded-full px-3 py-1">84% Capacidad</span></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 flex flex-col justify-between min-h-[180px]">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-4">Pedidos Entregados</div>
          <div className="text-4xl font-bold text-gray-800">3,892</div>
          <div className="mt-3"><span className="bg-gray-100 text-gray-600 text-xs font-semibold rounded-full px-3 py-1">T. Promedio: 14 min</span></div>
        </div>
        {/* Operator */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 min-h-[180px]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Operador activo</div>
              <div className="text-lg font-bold text-gray-800 mt-2">Operator Profile</div>
            </div>
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold rounded-full px-3 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
              Online
            </span>
          </div>
          <div className="space-y-3">
            <div className="bg-gray-100 rounded-md px-4 py-3">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Nombre</div>
              <div className="text-sm font-semibold text-gray-800 mt-1">María Torres</div>
            </div>
            <div className="bg-gray-100 rounded-md px-4 py-3">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Rol</div>
              <div className="text-sm font-semibold text-gray-800 mt-1">Operador</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-5 grid-cols-1 xl:grid-cols-[1.5fr_1fr]">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-5">Envíos por Mes</h3>
          <div className="h-[280px]">
            <AreaChartSVG data={monthlyData} dataKey="envios" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-5">Farmacias con más Pedidos</h3>
          <div className="h-[280px]">
            <BarChartSVG data={pharmaciesData} dataKey="pedidos" />
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Module: Inventory ────────────────────────────────────────────────────────
function InventoryModule() {
  return (
    <>
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-800">Inventario de Medicamentos</h3>
          <button className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
            + Agregar Producto
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-600 uppercase tracking-widest border-b border-gray-200">
                <th className="text-left pb-3 pr-4">Código</th>
                <th className="text-left pb-3 pr-4">Producto</th>
                <th className="text-left pb-3 pr-4">Stock</th>
                <th className="text-left pb-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 text-blue-700 font-semibold">{item.id}</td>
                  <td className="py-3 pr-4 text-gray-800">{item.nombre}</td>
                  <td className="py-3 pr-4 text-gray-800 font-semibold">{item.stock.toLocaleString()}</td>
                  <td className="py-3"><Badge text={item.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ─── Module: Orders ───────────────────────────────────────────────────────────
function OrdersModule() {
  return (
    <>
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-800">Pedidos Recientes</h3>
          <button className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
            + Nuevo Pedido
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-600 uppercase tracking-widest border-b border-gray-200">
                <th className="text-left pb-3 pr-4">Orden</th>
                <th className="text-left pb-3 pr-4">Farmacia</th>
                <th className="text-left pb-3 pr-4">Items</th>
                <th className="text-left pb-3 pr-4">Estado</th>
                <th className="text-left pb-3">Dron</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 text-blue-700 font-semibold">{order.id}</td>
                  <td className="py-3 pr-4 text-gray-800">{order.farmacia}</td>
                  <td className="py-3 pr-4 text-gray-800 font-semibold">{order.items}</td>
                  <td className="py-3 pr-4"><Badge text={order.estado} /></td>
                  <td className="py-3 text-gray-600">{order.dron}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ─── Module: Fleet Status ─────────────────────────────────────────────────────
function FleetModule() {
  return (
    <>
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {fleetData.map((drone) => (
          <div key={drone.id} className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-gray-800">{drone.id}</span>
              <Badge text={drone.estado} />
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">Batería</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${drone.bateria > 50 ? 'bg-blue-700' : drone.bateria > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${drone.bateria}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-1">{drone.bateria}%</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Ubicación</div>
                <div className="text-sm font-semibold text-gray-800 mt-1">{drone.ubicacion}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Module: Settings ─────────────────────────────────────────────────────────
function SettingsModule() {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 max-w-2xl">
      <h3 className="text-sm font-semibold text-gray-800 mb-6">Configuración General</h3>
      <div className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">NOMBRE DE LA ORGANIZACIÓN</label>
          <input type="text" defaultValue="Dron Salud S.A." className="w-full pl-3 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">EMAIL DE CONTACTO</label>
          <input type="email" defaultValue="admin@dronesalud.com" className="w-full pl-3 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">ZONA HORARIA</label>
          <select className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white">
            <option>America/Bogota (UTC-5)</option>
            <option>America/Santiago (UTC-4)</option>
            <option>America/Mexico_City (UTC-6)</option>
          </select>
        </div>
        <button className="bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-md transition-colors text-sm">
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const modules = [
  { key: 'dashboard',  icon: '📊', label: 'Dashboard' },
  { key: 'inventory',  icon: '📦', label: 'Inventory' },
  { key: 'orders',     icon: '📝', label: 'Orders' },
  { key: 'fleet',      icon: '🚁', label: 'Fleet Status' },
  { key: 'settings',   icon: '⚙️', label: 'Settings' },
]

const moduleTitles = {
  dashboard: 'Dashboard Ejecutivo',
  inventory: 'Inventario',
  orders:    'Pedidos',
  fleet:     'Estado de Flota',
  settings:  'Configuración',
}

export default function AdminPanelView({ onLogout }) {
  const [activeModule, setActiveModule] = useState('inventory')

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <DashboardModule />
      case 'inventory': return <InventoryModule />
      case 'orders':    return <OrdersModule />
      case 'fleet':     return <FleetModule />
      case 'settings':  return <SettingsModule />
      default:          return <DashboardModule />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-blue-900 text-white p-6 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white rounded-xl p-2 shadow">
              <img src={logo} alt="Dron Salud" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.35em] text-blue-200">Logística Médica</div>
              <div className="text-sm font-semibold text-white mt-0.5">Inteligente</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {modules.map((m) => (
              <SidebarItem
                key={m.key}
                icon={m.icon}
                label={m.label}
                active={activeModule === m.key}
                onClick={() => setActiveModule(m.key)}
              />
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="space-y-3 mt-8">
          <button className="w-full bg-white text-blue-900 font-semibold py-3 rounded-md hover:bg-gray-100 transition-colors text-sm">
            🚁 Despegar Dron
          </button>
          <button
            onClick={onLogout}
            className="w-full border border-blue-700 text-white font-semibold py-3 rounded-md hover:bg-blue-800 transition-colors text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">Resumen Operativo</div>
            <h1 className="text-3xl font-bold text-gray-800">{moduleTitles[activeModule]}</h1>
          </div>
          <div className="flex gap-3 items-center">
            <button className="border border-gray-200 bg-white rounded-md px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Últimos 30 Días
            </button>
            <button className="bg-blue-900 hover:bg-blue-800 text-white rounded-md px-5 py-2 text-sm font-semibold transition-colors">
              Exportar
            </button>
          </div>
        </div>

        {/* Module Content */}
        {renderModule()}
      </main>
    </div>
  )
}
