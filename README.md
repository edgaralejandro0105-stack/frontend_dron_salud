# DronSalud — Logística Médica Inteligente

Plataforma web de simulación para la gestión de entregas de medicamentos mediante drones. Cuatro portales especializados (admin, farmacia, operador, cliente) que cubren el ciclo completo: desde la compra del cliente hasta el despacho por dron.

## Tecnologías

- **React 19** — interfaz de usuario
- **Vite 8** — build tool
- **Tailwind CSS** (vía CDN) — estilos
- **Leaflet + react-leaflet** — mapas interactivos
- **Recharts** — gráficos (área, barras)
- **Lucide React** — iconos
- **Google Fonts** (Inter, Plus Jakarta Sans) — tipografía

> No hay backend real. Todos los datos (usuarios, pedidos, inventario, flota) están simulados en `src/data/adminData.js`.

## Roles y acceso

| Correo                  | Contraseña      | Rol        | Nombre         |
|-------------------------|-----------------|------------|----------------|
| admin@dronesalud.com    | Admin1234!      | admin      | María Torres   |
| cliente@dronesalud.com  | Cliente1234!    | cliente    | Juan Pérez     |
| farmacia@dronesalud.com | Farmacia1234!   | farmacia   | Laura Méndez   |
| operador@dronesalud.com | Dron1234!       | operador   | Carlos Gómez   |

## Módulos por rol

### Admin
- **Dashboard** — KPIs, gráfico de envíos mensuales, barras por farmacia
- **Pedidos** — tabla global con búsqueda y detalle expandible
- **Flota** — estado de drones (batería, ubicación, disponibilidad)
- **Despacho de Dron** — asignar drones a pedidos listos y lanzar
- **Gestión de Usuarios** — registrar operadores y farmacias con selector de ubicación en mapa

### Farmacia
- **Dashboard** — métricas propias con foto de perfil de la farmacia
- **Inventario** — tabla con búsqueda, indicador de stock (disponible/bajo/crítico), agregar/editar/eliminar productos con foto
- **Órdenes Recibidas** — pedidos entrantes con flujo Pendiente → Pagado → Preparado → En tránsito → Entregado, referencia de pago, botón "Listo para recolección", instrucciones con envío de comprobante, alerta de nuevo pedido (sondeo cada 5s), órdenes Preparando no leídas resaltadas en gris oscuro
- **Historial de Pedidos** — pedidos finalizados
- **Configurar Pago** — datos de pago móvil (banco, teléfono, CI, titular) + galería de la farmacia (foto de fachada y logo)

> **Campana de notificaciones**: En el header (junto al reloj), una campana con badge rojo que sondea cada 5s nuevas órdenes `Pendiente` y al hacer clic navega a Órdenes Recibidas.

### Operador
- **Despacho de Dron** — aceptar pedidos preparados, seleccionar dron disponible, lanzar vuelo
- **Historial de Entregas** — entregas completadas con detalle
- **Flota** — estado de drones

### Cliente
- **Nuevo Pedido** — seleccionar farmacia, navegar catálogo, agregar al carrito, elegir destino en mapa, confirmar pedido
- **Historial de Compras** — pedidos anteriores con estado y seguimiento

## Enrutamiento

La app usa una máquina de estados simple con `useState` (sin react-router):

| Estado     | Descripción                        |
|------------|------------------------------------|
| `login`    | Pantalla de inicio de sesión       |
| `register` | Pantalla de registro de cuenta     |
| `panel`    | Dashboard con sidebar y módulos    |

Los módulos visibles en el sidebar se determinan según `roleModules` en `adminData.js`:

| Rol        | Módulos                                                       |
|------------|---------------------------------------------------------------|
| admin      | dashboard, orders, fleet, operator, adminManagement           |
| cliente    | shopping                                                      |
| farmacia   | pharmacyDashboard, inventory, ordersReceived, pharmacyHistory, pharmacyPayment |
| operador   | operator, operatorHistory, fleet                              |

El layout base (`DashboardLayout`) mapea cada clave de módulo a su componente mediante `moduleMap`.

## Estructura del proyecto

```
src/
├── assets/                        # Imágenes (logo, hero)
├── components/
│   ├── charts/                    # Gráficos Recharts (AreaChart, BarChart)
│   ├── maps/                      # Mapa interactivo (LocationPicker)
│   ├── pharmacy/                  # PharmacyProfileCard
│   └── ui/                        # Componentes reutilizables
│       ├── Badge.jsx
│       ├── DroneDelivery.jsx
│       ├── SidebarItem.jsx
│       ├── SupportButton.jsx
│       └── UserProfileCard.jsx
├── data/
│   └── adminData.js               # Datos simulados y configuración de módulos
├── layouts/
│   └── DashboardLayout.jsx        # Layout principal con sidebar, header y reloj
├── pages/
│   ├── admin/
│   │   ├── DashboardPage.jsx      # KPIs y gráficos
│   │   ├── FleetPage.jsx          # Estado de flota de drones
│   │   ├── OrdersPage.jsx         # Tabla global de pedidos
│   │   └── UserManagementPage.jsx # CRUD de usuarios con mapa
│   ├── auth/
│   │   ├── LoginPage.jsx          # Inicio de sesión
│   │   └── RegisterPage.jsx       # Registro de cuenta
│   ├── client/
│   │   ├── NewOrderPage.jsx       # Compra: farmacia, catálogo, carrito, mapa
│   │   ├── PurchaseHistoryPage.jsx# Historial de compras del cliente
│   │   └── ShoppingPage.jsx       # Portal completo del cliente
│   ├── operator/
│   │   ├── DispatchPage.jsx       # Aceptar pedido, elegir dron, lanzar
│   │   └── HistoryPage.jsx        # Historial de entregas
│   └── pharmacy/
│       ├── DashboardPage.jsx      # Dashboard de farmacia
│       ├── InventoryPage.jsx      # Gestión de inventario (CRUD con modal)
│       ├── OrderHistoryPage.jsx   # Historial de pedidos
│       ├── OrdersReceivedPage.jsx # Órdenes entrantes con flujo de estados
│       └── PaymentConfigPage.jsx  # Configuración de pago móvil + galería
├── App.jsx                        # Raíz con máquina de estados
├── index.css                      # Estilos globales y animaciones Tailwind
└── main.jsx                       # Punto de entrada
```

## Comandos

```bash
npm run dev       # Iniciar servidor de desarrollo (Vite)
npm run build     # Compilar para producción
npm run preview   # Previsualizar build de producción
npm run lint      # Ejecutar ESLint
```
