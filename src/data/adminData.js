export const monthlyData = [
  { name: 'Ene', envios: 1200, ingresos: 18500000 },
  { name: 'Feb', envios: 1900, ingresos: 22300000 },
  { name: 'Mar', envios: 1500, ingresos: 19800000 },
  { name: 'Abr', envios: 2200, ingresos: 25600000 },
  { name: 'May', envios: 2800, ingresos: 34200000 },
  { name: 'Jun', envios: 2500, ingresos: 30100000 },
]

export const pharmaciesData = [
  { name: 'Farmatodo', pedidos: 850, ingresos: 12500000, entregas: 790 },
  { name: 'Farmahorro', pedidos: 620, ingresos: 9800000, entregas: 580 },
  { name: 'Locatel', pedidos: 540, ingresos: 8200000, entregas: 510 },
  { name: 'Fcia SAAS', pedidos: 490, ingresos: 7500000, entregas: 460 },
  { name: 'Fcia Central', pedidos: 380, ingresos: 6100000, entregas: 360 },
]

export const weeklyRevenue = [
  { week: 'S1', ingresos: 18.5 },
  { week: 'S2', ingresos: 22.3 },
  { week: 'S3', ingresos: 19.8 },
  { week: 'S4', ingresos: 25.6 },
  { week: 'S5', ingresos: 24.2 },
  { week: 'S6', ingresos: 27.8 },
  { week: 'S7', ingresos: 26.5 },
  { week: 'S8', ingresos: 30.1 },
]

export const ordenesPorEstado = [
  { estado: 'Entregado', valor: 42, color: '#059669' },
  { estado: 'En tránsito', valor: 18, color: '#2563eb' },
  { estado: 'Preparado', valor: 15, color: '#d97706' },
  { estado: 'Preparando', valor: 25, color: '#7c3aed' },
]

export const dashboardKPIs = {
  ingresos: { valor: 150500000, crecimiento: 12.5, formato: 'moneda' },
  pedidos: { valor: 1250, crecimiento: 8.3, formato: 'numero' },
  entregados: { valor: 890, crecimiento: 15.2, formato: 'numero' },
  drones: { activos: 4, totales: 6, capacidad: 84 },
  tiempoEntrega: { valor: 24, tendencia: -5.2, formato: 'tiempo' },
  satisfaccion: { valor: 4.8, maximo: 5, tendencia: 0.3, formato: 'estrellas' },
}

export const inventoryData = [
  { id: 'MED-001', nombre: 'Ibuprofeno',    concentracion: '400mg',   stock: 1240, estado: 'Disponible', precio: 2500,  unidad: 'Tabletas',  farmaciaId: 'FARM-001', especificaciones: 'Antiinflamatorio no esteroideo. Vía oral.', foto: '', categoria: 'Analgésicos' },
  { id: 'MED-002', nombre: 'Amoxicilina',   concentracion: '500mg',   stock: 860,  estado: 'Disponible', precio: 3200,  unidad: 'Cápsulas',  farmaciaId: 'FARM-002', especificaciones: 'Antibiótico betalactámico. Vía oral.', foto: '', categoria: 'Antibióticos' },
  { id: 'MED-003', nombre: 'Insulina NPH',  concentracion: '100 UI/ml', stock: 8,    estado: 'Bajo stock', precio: 18500, unidad: 'Ampollas',  farmaciaId: 'FARM-003', especificaciones: 'Insulina de acción intermedia. Vía subcutánea.', foto: '', categoria: 'Endocrinología' },
  { id: 'MED-004', nombre: 'Paracetamol',   concentracion: '500mg',   stock: 2100, estado: 'Disponible', precio: 1800,  unidad: 'Tabletas',  farmaciaId: 'FARM-001', especificaciones: 'Analgésico y antipirético. Vía oral.', foto: '', categoria: 'Analgésicos' },
  { id: 'MED-005', nombre: 'Losartán',      concentracion: '50mg',    stock: 320,  estado: 'Disponible', precio: 4200,  unidad: 'Tabletas',  farmaciaId: 'FARM-002', especificaciones: 'Antagonista de receptores de angiotensina II. Vía oral.', foto: '', categoria: 'Cardiovascular' },
  { id: 'MED-006', nombre: 'Omeprazol',     concentracion: '20mg',    stock: 3,    estado: 'Crítico',    precio: 9500,  unidad: 'Cápsulas',  farmaciaId: 'FARM-003', especificaciones: 'Inhibidor de la bomba de protones. Vía oral.', foto: '', categoria: 'Digestivo' },
  { id: 'MED-007', nombre: 'Atorvastatina', concentracion: '20mg',    stock: 540,  estado: 'Disponible', precio: 8500,  unidad: 'Tabletas',  farmaciaId: 'FARM-004', especificaciones: 'Hipolipemiante. Reduce colesterol LDL. Vía oral.', foto: '', categoria: 'Cardiovascular' },
  { id: 'MED-008', nombre: 'Metformina',    concentracion: '850mg',   stock: 720,  estado: 'Disponible', precio: 3800,  unidad: 'Tabletas',  farmaciaId: 'FARM-004', especificaciones: 'Antidiabético oral. Biguanida. Vía oral.', foto: '', categoria: 'Endocrinología' },
  { id: 'MED-009', nombre: 'Salbutamol',    concentracion: '100mcg',  stock: 200,  estado: 'Disponible', precio: 6200,  unidad: 'Inhalador', farmaciaId: 'FARM-005', especificaciones: 'Broncodilatador. Agonista beta-2 adrenérgico. Vía inhalada.', foto: '', categoria: 'Respiratorio' },
  { id: 'MED-010', nombre: 'Loratadina',    concentracion: '10mg',    stock: 410,  estado: 'Disponible', precio: 2800,  unidad: 'Tabletas',  farmaciaId: 'FARM-005', especificaciones: 'Antihistamínico no sedante. Vía oral.', foto: '', categoria: 'Alergias' },
]

export const ordersData = [
  {
    id: 'ORD-3901', farmacia: 'Farmatodo', farmaciaId: 'FARM-001', clienteId: 'CLI-001',
    estado: 'Preparando', dron: '—',
    fecha: '10/06/2026 08:15',
    productos: [
      { id: 'MED-001', nombre: 'Ibuprofeno 400mg',  cantidad: 2, precio: 2500 },
      { id: 'MED-004', nombre: 'Paracetamol 500mg', cantidad: 1, precio: 1800 },
    ],
    subtotal: 6800, cargo_dron: 5000, iva: 1088, total: 12888,
    referencia: '246813579',
    destino: { nombre: 'Residencia Juan Pérez', direccion: 'Av. España, Edif. San Carlos, San Cristóbal', lat: 7.7710, lng: -72.2270 }
  },
  {
    id: 'ORD-3902', farmacia: 'Farmatodo', farmaciaId: 'FARM-001', clienteId: 'CLI-001',
    estado: 'Preparado', dron: '—',
    fecha: '09/06/2026 14:30',
    productos: [
      { id: 'MED-004', nombre: 'Paracetamol 500mg', cantidad: 2, precio: 1800 },
      { id: 'MED-001', nombre: 'Ibuprofeno 400mg',  cantidad: 1, precio: 2500 },
    ],
    subtotal: 6100, cargo_dron: 5000, iva: 976, total: 12076,
    destino: { nombre: 'Hospital Central', direccion: 'Av. España, Centro', lat: 7.7710, lng: -72.2270 }
  },
  {
    id: 'ORD-3903', farmacia: 'Farmatodo', farmaciaId: 'FARM-001', clienteId: 'CLI-001',
    estado: 'Preparando', dron: '—',
    fecha: '08/06/2026 10:00',
    productos: [
      { id: 'MED-001', nombre: 'Ibuprofeno 400mg',  cantidad: 3, precio: 2500 },
      { id: 'MED-002', nombre: 'Amoxicilina 500mg', cantidad: 2, precio: 3200 },
    ],
    subtotal: 13900, cargo_dron: 5000, iva: 2224, total: 21124,
    destino: { nombre: 'Hospital Central', direccion: 'Av. España, Centro', lat: 7.7710, lng: -72.2270 }
  },
  {
    id: 'ORD-3904', farmacia: 'Farmatodo', farmaciaId: 'FARM-001', clienteId: 'CLI-001',
    estado: 'Entregado', dron: 'DRN-12', operador: 'Carlos Gómez',
    fecha: '06/06/2026 16:45',
    productos: [
      { id: 'MED-005', nombre: 'Losartán 50mg',  cantidad: 2, precio: 4200 },
      { id: 'MED-001', nombre: 'Ibuprofeno 400mg', cantidad: 3, precio: 2500 },
    ],
    subtotal: 15900, cargo_dron: 5000, iva: 2544, total: 23444,
    destino: { nombre: 'Clínica La Ermita', direccion: 'Av. 19 de Abril, La Ermita', lat: 7.7640, lng: -72.2220 }
  },
]

export const fleetData = [
  { id: 'DRN-03', modelo: 'DJI Mavic 3 Enterprise', matricula: 'YV-312-DRN', fechaAdquisicion: '2025-03-15', estado: 'En vuelo', foto: '' },
  { id: 'DRN-07', modelo: 'DJI Matrice 350 RTK',    matricula: 'YV-871-DRN', fechaAdquisicion: '2025-06-01', estado: 'En vuelo', foto: '' },
  { id: 'DRN-12', modelo: 'Autel EVO Max 4T',       matricula: 'YV-455-DRN', fechaAdquisicion: '2025-09-20', estado: 'Cargando', foto: '' },
  { id: 'DRN-15', modelo: 'DJI Mavic 3E Thermal',   matricula: 'YV-223-DRN', fechaAdquisicion: '2026-01-10', estado: 'Disponible', foto: '' },
  { id: 'DRN-21', modelo: 'Parrot Anafi USA',        matricula: 'YV-698-DRN', fechaAdquisicion: '2026-02-28', estado: 'En vuelo', foto: '' },
  { id: 'DRN-28', modelo: 'Skydio X10',              matricula: 'YV-544-DRN', fechaAdquisicion: '2026-04-05', estado: 'Mantenimiento', foto: '' },
]

function svgLogo(letter, bg) {
  const s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="' + bg + '"/><text x="50" y="68" font-size="48" font-weight="bold" fill="white" text-anchor="middle">' + letter + '</text></svg>'
  return 'data:image/svg+xml,' + encodeURIComponent(s)
}

function svgFacade(name, bg) {
  const s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="400" height="200" fill="' + bg + '"/><rect x="40" y="60" width="320" height="140" fill="rgba(255,255,255,0.15)" rx="8"/><rect x="70" y="90" width="55" height="55" fill="rgba(255,255,255,0.2)" rx="4"/><rect x="145" y="90" width="55" height="55" fill="rgba(255,255,255,0.2)" rx="4"/><rect x="220" y="90" width="55" height="55" fill="rgba(255,255,255,0.2)" rx="4"/><rect x="295" y="90" width="55" height="55" fill="rgba(255,255,255,0.2)" rx="4"/><text x="200" y="38" font-size="15" font-weight="bold" fill="rgba(255,255,255,0.7)" text-anchor="middle">' + name + '</text></svg>'
  return 'data:image/svg+xml,' + encodeURIComponent(s)
}

export const pharmacyProfiles = [
  { id: 'FARM-001', nombre: 'Farmatodo',    direccion: 'Av. Carabobo, CC Las Pilas',       telefono: '0276-3561234', email: 'contacto@farmatodo.sc.com',   ciudad: 'San Cristóbal', lat: 7.7690, lng: -72.2260, fotoFachada: svgFacade('Farmatodo','#2563eb'), logo: svgLogo('F','#2563eb'), pagoMovil: { banco: 'Banco Mercantil', telefono: '0412-3456789', ci: 'J-12345678-9', titular: 'Farmatodo C.A.' } },
  { id: 'FARM-002', nombre: 'Farmahorro',   direccion: 'Av. 19 de Abril, Sector La Ermita', telefono: '0276-3415678', email: 'info@farmahorro.com',       ciudad: 'San Cristóbal', lat: 7.7660, lng: -72.2240, fotoFachada: svgFacade('Farmahorro','#059669'), logo: svgLogo('H','#059669'), pagoMovil: { banco: 'Banco Provincial', telefono: '0414-5678901', ci: 'J-23456789-0', titular: 'Farmahorro S.R.L.' } },
  { id: 'FARM-003', nombre: 'Locatel',      direccion: 'Av. España, CC Sambil',             telefono: '0276-3559876', email: 'contacto@locatel.com',      ciudad: 'San Cristóbal', lat: 7.7700, lng: -72.2280, fotoFachada: svgFacade('Locatel','#dc2626'), logo: svgLogo('L','#dc2626'), pagoMovil: { banco: 'Banco Banesco', telefono: '0426-7890123', ci: 'J-34567890-1', titular: 'Locatel Salud C.A.' } },
  { id: 'FARM-004', nombre: 'Farmacia SAAS', direccion: 'Av. Principal de Barrio Obrero',   telefono: '0276-3434567', email: 'farmacia.saas@correo.com',   ciudad: 'San Cristóbal', lat: 7.7670, lng: -72.2220, fotoFachada: svgFacade('Farmacia SAAS','#7c3aed'), logo: svgLogo('S','#7c3aed'), pagoMovil: { banco: 'Banco Occidental de Descuento', telefono: '0412-9012345', ci: 'V-12345678', titular: 'Farmacia SAAS' } },
  { id: 'FARM-005', nombre: 'Farmacia Central', direccion: 'Calle 5, Centro',               telefono: '0276-3527890', email: 'central.sc@correo.com',     ciudad: 'San Cristóbal', lat: 7.7685, lng: -72.2235, fotoFachada: svgFacade('Farmacia Central','#d97706'), logo: svgLogo('C','#d97706'), pagoMovil: { banco: 'Banco de Venezuela', telefono: '0416-1234567', ci: 'J-45678901-2', titular: 'Farmacia Central C.A.' } },
]

export const currentPharmacyId = 'FARM-001'

export const users = [
  {
    email: 'admin@dronesalud.com',
    password: 'Admin1234!',
    role: 'admin',
    nombre: 'María Torres',
    rol: 'Administrador General',
    telefono: '3009876543',
  },
  {
    id: 'CLI-001',
    email: 'cliente@dronesalud.com',
    password: 'Cliente1234!',
    role: 'cliente',
    nombre: 'Juan Pérez',
    rol: 'Cliente',
    telefono: '3011234567',
    direccion: 'Av. España, Edif. San Carlos, Piso 3, San Cristóbal',
  },
  {
    email: 'farmacia@dronesalud.com',
    password: 'Farmacia1234!',
    role: 'farmacia',
    nombre: 'Farmacia',
    rol: 'Farmacia',
    telefono: '3027654321',
    farmaciaId: 'FARM-001',
  },
  {
    email: 'operador@dronesalud.com',
    password: 'Dron1234!',
    role: 'operador',
    nombre: 'Carlos Gómez',
    rol: 'Operador de Drones',
    telefono: '3039876543',
  },
]

export const operatorProfile = {
  nombre: 'Carlos Gómez',
  rol: 'Operador de Drones',
  telefono: '3039876543',
  email: 'carlos.gomez@dronesalud.com',
  cedula: 'V-12.345.678',
  licencia: 'DRN-LIC-2024-047',
  horasVuelo: 1250,
  foto: '',
}

export const roleModules = {
  admin: ['dashboard', 'orders', 'fleet', 'operator', 'adminManagement'],
  cliente: ['shopping'],
  farmacia: ['pharmacyDashboard', 'inventory', 'ordersReceived', 'pharmacyHistory', 'pharmacyPayment'],
  operador: ['operator', 'operatorHistory', 'fleet'],
}

export const userProfile = {
  nombre: 'María Torres',
  email: 'maria.torres@dronesalud.com',
  rol: 'Administrador General',
  telefono: '3009876543',
}

export const modules = [
  { key: 'dashboard',  icon: '', label: 'Dashboard' },
  { key: 'pharmacyDashboard', icon: '', label: 'Dashboard' },
  { key: 'inventory',  icon: '', label: 'Inventario' },
  { key: 'orders',     icon: '', label: 'Pedidos' },
  { key: 'shopping',   icon: '', label: 'Nuevo Pedido' },
  { key: 'operator',   icon: '', label: 'Despegar Dron' },
  { key: 'fleet',      icon: '', label: 'Estado de Flota' },
  { key: 'ordersReceived', icon: '', label: 'Órdenes Recibidas' },
  { key: 'pharmacyHistory', icon: '', label: 'Historial de Pedidos' },
  { key: 'operatorHistory', icon: '', label: 'Historial de Entregas' },
  { key: 'adminManagement', icon: '', label: 'Gestion de Usuarios' },
  { key: 'pharmacyPayment', icon: '', label: 'Configurar Pago' },
]

export const moduleTitles = {
  dashboard: 'Dashboard Ejecutivo',
  inventory: 'Inventario',
  orders:    'Pedidos',
  shopping:  'Nuevo Pedido',
  fleet:     'Estado de Flota',
  operator:  'Despacho de Dron',
  ordersReceived: 'Órdenes Recibidas',
  pharmacyHistory: 'Historial de Pedidos',
  pharmacyDashboard: 'Dashboard',
  operatorHistory: 'Historial de Entregas',
  adminManagement: 'Gestion de Usuarios',
  pharmacyPayment: 'Configuración de Pago',
}
