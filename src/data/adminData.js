export const monthlyData = [
  { name: 'Ene', envios: 1200 },
  { name: 'Feb', envios: 1900 },
  { name: 'Mar', envios: 1500 },
  { name: 'Abr', envios: 2200 },
  { name: 'May', envios: 2800 },
  { name: 'Jun', envios: 2500 },
]

export const pharmaciesData = [
  { name: 'F.Cent', pedidos: 850 },
  { name: 'S.Plus', pedidos: 620 },
  { name: 'BioM',   pedidos: 540 },
  { name: 'MediC',  pedidos: 490 },
  { name: 'CruzV',  pedidos: 380 },
]

export const inventoryData = [
  { id: 'MED-001', nombre: 'Ibuprofeno',    concentracion: '400mg',   stock: 1240, estado: 'Disponible', precio: 2500,  unidad: 'Tabletas',  farmaciaId: 'FARM-001', especificaciones: 'Antiinflamatorio no esteroideo. Vía oral.', foto: '', categoria: 'Analgésicos' },
  { id: 'MED-002', nombre: 'Amoxicilina',   concentracion: '500mg',   stock: 860,  estado: 'Disponible', precio: 3200,  unidad: 'Cápsulas',  farmaciaId: 'FARM-002', especificaciones: 'Antibiótico betalactámico. Vía oral.', foto: '', categoria: 'Antibióticos' },
  { id: 'MED-003', nombre: 'Insulina NPH',  concentracion: '100 UI/ml', stock: 45,   estado: 'Bajo stock', precio: 18500, unidad: 'Ampollas',  farmaciaId: 'FARM-003', especificaciones: 'Insulina de acción intermedia. Vía subcutánea.', foto: '', categoria: 'Endocrinología' },
  { id: 'MED-004', nombre: 'Paracetamol',   concentracion: '500mg',   stock: 2100, estado: 'Disponible', precio: 1800,  unidad: 'Tabletas',  farmaciaId: 'FARM-001', especificaciones: 'Analgésico y antipirético. Vía oral.', foto: '', categoria: 'Analgésicos' },
  { id: 'MED-005', nombre: 'Losartán',      concentracion: '50mg',    stock: 320,  estado: 'Disponible', precio: 4200,  unidad: 'Tabletas',  farmaciaId: 'FARM-002', especificaciones: 'Antagonista de receptores de angiotensina II. Vía oral.', foto: '', categoria: 'Cardiovascular' },
  { id: 'MED-006', nombre: 'Omeprazol',     concentracion: '20mg',    stock: 18,   estado: 'Crítico',    precio: 9500,  unidad: 'Cápsulas',  farmaciaId: 'FARM-003', especificaciones: 'Inhibidor de la bomba de protones. Vía oral.', foto: '', categoria: 'Digestivo' },
  { id: 'MED-007', nombre: 'Atorvastatina', concentracion: '20mg',    stock: 540,  estado: 'Disponible', precio: 8500,  unidad: 'Tabletas',  farmaciaId: 'FARM-004', especificaciones: 'Hipolipemiante. Reduce colesterol LDL. Vía oral.', foto: '', categoria: 'Cardiovascular' },
  { id: 'MED-008', nombre: 'Metformina',    concentracion: '850mg',   stock: 720,  estado: 'Disponible', precio: 3800,  unidad: 'Tabletas',  farmaciaId: 'FARM-004', especificaciones: 'Antidiabético oral. Biguanida. Vía oral.', foto: '', categoria: 'Endocrinología' },
  { id: 'MED-009', nombre: 'Salbutamol',    concentracion: '100mcg',  stock: 200,  estado: 'Disponible', precio: 6200,  unidad: 'Inhalador', farmaciaId: 'FARM-005', especificaciones: 'Broncodilatador. Agonista beta-2 adrenérgico. Vía inhalada.', foto: '', categoria: 'Respiratorio' },
  { id: 'MED-010', nombre: 'Loratadina',    concentracion: '10mg',    stock: 410,  estado: 'Disponible', precio: 2800,  unidad: 'Tabletas',  farmaciaId: 'FARM-005', especificaciones: 'Antihistamínico no sedante. Vía oral.', foto: '', categoria: 'Alergias' },
]

export const ordersData = [
  {
    id: 'ORD-3902', farmacia: 'Farmatodo', farmaciaId: 'FARM-001', clienteId: 'CLI-001',
    estado: 'Preparado', dron: '—',
    fecha: '07/06/2026 10:00',
    productos: [
      { id: 'MED-004', nombre: 'Paracetamol 500mg', cantidad: 2, precio: 1800 },
      { id: 'MED-001', nombre: 'Ibuprofeno 400mg',  cantidad: 1, precio: 2500 },
    ],
    subtotal: 6100, cargo_dron: 5000, iva: 976, total: 12076,
    destino: { nombre: 'Hospital Central', direccion: 'Av. España, Centro', lat: 7.7710, lng: -72.2270 }
  },
  {
    id: 'ORD-3901', farmacia: 'Farmatodo', farmaciaId: 'FARM-001', clienteId: 'CLI-001',
    estado: 'En tránsito', dron: 'DRN-07', operador: 'Carlos Gómez',
    fecha: '05/06/2026 14:30',
    productos: [
      { id: 'MED-001', nombre: 'Ibuprofeno 400mg',  cantidad: 5, precio: 2500 },
      { id: 'MED-002', nombre: 'Amoxicilina 500mg', cantidad: 3, precio: 3200 },
      { id: 'MED-004', nombre: 'Paracetamol 500mg', cantidad: 4, precio: 1800 },
    ],
    subtotal: 30500, cargo_dron: 5000, iva: 4880, total: 40380,
    destino: { nombre: 'Hospital Central', direccion: 'Av. España, Centro', lat: 7.7710, lng: -72.2270 }
  },
  {
    id: 'ORD-3900', farmacia: 'Farmahorro', farmaciaId: 'FARM-002', clienteId: 'CLI-001',
    estado: 'Entregado', dron: 'DRN-12', operador: 'Carlos Gómez',
    fecha: '02/06/2026 10:15',
    productos: [
      { id: 'MED-005', nombre: 'Losartán 50mg',  cantidad: 2, precio: 4200 },
      { id: 'MED-001', nombre: 'Ibuprofeno 400mg', cantidad: 3, precio: 2500 },
    ],
    subtotal: 15900, cargo_dron: 5000, iva: 2544, total: 23444,
    destino: { nombre: 'Clínica La Ermita', direccion: 'Av. 19 de Abril, La Ermita', lat: 7.7640, lng: -72.2220 }
  },
  {
    id: 'ORD-3899', farmacia: 'Locatel', farmaciaId: 'FARM-003', clienteId: 'CLI-002',
    estado: 'Preparando', dron: '—',
    fecha: '28/05/2026 16:45',
    productos: [
      { id: 'MED-003', nombre: 'Insulina NPH',    cantidad: 4, precio: 18500 },
      { id: 'MED-006', nombre: 'Omeprazol 20mg',  cantidad: 4, precio: 9500 },
    ],
    subtotal: 112000, cargo_dron: 8000, iva: 17920, total: 137920,
    destino: { nombre: 'Centro Médico San Cristóbal', direccion: 'Carrera 3, Barrio Obrero', lat: 7.7655, lng: -72.2205 }
  },
  {
    id: 'ORD-3898', farmacia: 'Farmacia SAAS', farmaciaId: 'FARM-004', clienteId: 'CLI-001',
    estado: 'Entregado', dron: 'DRN-03', operador: 'Carlos Gómez',
    fecha: '25/05/2026 09:00',
    productos: [
      { id: 'MED-001', nombre: 'Ibuprofeno 400mg', cantidad: 3, precio: 2500 },
    ],
    subtotal: 7500, cargo_dron: 5000, iva: 1200, total: 13700,
    destino: { nombre: 'Residencia Los Andes', direccion: 'Av. Principal, Barrio Obrero', lat: 7.7665, lng: -72.2210 }
  },
  {
    id: 'ORD-3897', farmacia: 'Farmacia Central', farmaciaId: 'FARM-005', clienteId: 'CLI-001',
    estado: 'En tránsito', dron: 'DRN-21',
    fecha: '07/06/2026 08:20',
    productos: [
      { id: 'MED-002', nombre: 'Amoxicilina 500mg', cantidad: 6, precio: 3200 },
      { id: 'MED-004', nombre: 'Paracetamol 500mg', cantidad: 5, precio: 1800 },
      { id: 'MED-005', nombre: 'Losartán 50mg',     cantidad: 4, precio: 4200 },
    ],
    subtotal: 45000, cargo_dron: 6000, iva: 7200, total: 58200,
    destino: { nombre: 'Clínica San José', direccion: 'Av. Carabobo, Las Pilas', lat: 7.7680, lng: -72.2245 }
  },
]

export const fleetData = [
  { id: 'DRN-03', bateria: 92, estado: 'En vuelo',    ubicacion: 'Zona Norte' },
  { id: 'DRN-07', bateria: 78, estado: 'En vuelo',    ubicacion: 'Centro' },
  { id: 'DRN-12', bateria: 45, estado: 'Cargando',    ubicacion: 'Base' },
  { id: 'DRN-15', bateria: 100, estado: 'Disponible', ubicacion: 'Base' },
  { id: 'DRN-21', bateria: 65, estado: 'En vuelo',    ubicacion: 'Zona Sur' },
  { id: 'DRN-28', bateria: 12, estado: 'Mantenimiento', ubicacion: 'Taller' },
]

export const pharmacyProfiles = [
  { id: 'FARM-001', nombre: 'Farmatodo',    direccion: 'Av. Carabobo, CC Las Pilas',       telefono: '0276-3561234', email: 'contacto@farmatodo.sc.com',   ciudad: 'San Cristóbal', lat: 7.7690, lng: -72.2260 },
  { id: 'FARM-002', nombre: 'Farmahorro',   direccion: 'Av. 19 de Abril, Sector La Ermita', telefono: '0276-3415678', email: 'info@farmahorro.com',       ciudad: 'San Cristóbal', lat: 7.7660, lng: -72.2240 },
  { id: 'FARM-003', nombre: 'Locatel',      direccion: 'Av. España, CC Sambil',             telefono: '0276-3559876', email: 'contacto@locatel.com',      ciudad: 'San Cristóbal', lat: 7.7700, lng: -72.2280 },
  { id: 'FARM-004', nombre: 'Farmacia SAAS', direccion: 'Av. Principal de Barrio Obrero',   telefono: '0276-3434567', email: 'farmacia.saas@correo.com',   ciudad: 'San Cristóbal', lat: 7.7670, lng: -72.2220 },
  { id: 'FARM-005', nombre: 'Farmacia Central', direccion: 'Calle 5, Centro',               telefono: '0276-3527890', email: 'central.sc@correo.com',     ciudad: 'San Cristóbal', lat: 7.7685, lng: -72.2235 },
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
    nombre: 'Laura Méndez',
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

export const roleModules = {
  admin: ['dashboard', 'orders', 'fleet', 'operator', 'adminManagement'],
  cliente: ['shopping'],
  farmacia: ['pharmacyDashboard', 'inventory', 'ordersReceived', 'pharmacyHistory'],
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
}
