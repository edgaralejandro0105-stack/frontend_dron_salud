# DronSalud — Logística Médica Inteligente

Plataforma web de simulación para la gestión de entregas de medicamentos mediante drones. Cuatro portales especializados (admin, farmacia, operador, cliente) que cubren el ciclo completo: desde la compra del cliente hasta el despacho por dron.

---

## ✨ Funcionalidades principales

- **Portal Admin** — Dashboard ejecutivo con KPIs, gráficos interactivos (área, barras, donut), gestión de pedidos, flota de drones y usuarios
- **Portal Farmacia** — Dashboard propio, inventario con CRUD, órdenes entrantes con flujo de estados (Pendiente → Pagado → Preparado → En tránsito → Entregado), historial y configuración de pago móvil
- **Portal Operador** — Despacho de drones, historial de entregas, monitoreo de flota
- **Portal Cliente** — Catálogo de productos, carrito de compras, selección de destino en mapa interactivo, historial de compras

---

## 🚀 Primeros pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd fron_drone_salud

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir http://localhost:5173 en el navegador
```

## Comandos disponibles

| Comando             | Descripción                                    |
|---------------------|------------------------------------------------|
| `npm run dev`       | Inicia servidor de desarrollo (Vite)           |
| `npm run build`     | Compila para producción                        |
| `npm run preview`   | Previsualiza el build de producción            |
| `npm run lint`      | Ejecuta ESLint                                 |

---

## 🔐 Acceso por roles

| Correo                  | Contraseña      | Rol        | Nombre         |
|-------------------------|-----------------|------------|----------------|
| admin@dronesalud.com    | Admin1234!      | admin      | María Torres   |
| cliente@dronesalud.com  | Cliente1234!    | cliente    | Juan Pérez     |
| farmacia@dronesalud.com | Farmacia1234!   | farmacia   | Laura Méndez   |
| operador@dronesalud.com | Dron1234!       | operador   | Carlos Gómez   |

---

## 🧭 Módulos por rol

### Admin
| Módulo              | Descripción |
|---------------------|-------------|
| **Dashboard**       | 6 KPIs animados (ingresos, pedidos, entregados, drones activos, tiempo promedio, satisfacción), gráfico de envíos mensuales (curva bezier con glow), donut de estados de pedidos, barras por farmacia, lista de pedidos recientes |
| **Pedidos**         | Tabla global con búsqueda, filtros y detalle expandible |
| **Flota**           | Estado de drones con modal para agregar/editar |
| **Despacho de Dron**| Asignar drones a pedidos listos y lanzar vuelo |
| **Gestión de Usuarios** | Registrar operadores y farmacias con selector de ubicación en mapa Leaflet |

### Farmacia
| Módulo              | Descripción |
|---------------------|-------------|
| **Dashboard**       | Métricas propias con foto de perfil de la farmacia |
| **Inventario**      | CRUD completo con modal, búsqueda, indicador de stock (Disponible/Bajo/Crítico), carga de foto |
| **Órdenes Recibidas** | Flujo completo: Pendiente → Pagado (con referencia) → Preparado → En tránsito → Entregado. Alerta de nuevos pedidos (sondeo cada 5s). Órdenes no leídas resaltadas |
| **Historial**       | Pedidos finalizados con detalle |
| **Configurar Pago** | Datos de pago móvil (banco, teléfono, CI, titular) + galería (foto de fachada y logo) |

> 🔔 **Campana de notificaciones**: En el header (junto al reloj), una campana con badge rojo que sondea cada 5s nuevas órdenes `Pendiente`. Al hacer clic navega automáticamente al módulo de Órdenes Recibidas.

### Operador
| Módulo              | Descripción |
|---------------------|-------------|
| **Despacho de Dron**| Ver pedidos preparados, seleccionar dron disponible, lanzar vuelo |
| **Historial**       | Entregas completadas con detalle de cada una |
| **Flota**           | Estado de drones |

### Cliente
| Módulo              | Descripción |
|---------------------|-------------|
| **Nuevo Pedido**    | Seleccionar farmacia → navegar catálogo → agregar al carrito → elegir destino en mapa → confirmar |
| **Historial**       | Pedidos anteriores con estado y seguimiento |

---

## 🏗️ Arquitectura

### Frontend
| Tecnología       | Uso |
|------------------|-----|
| **React 19**     | Interfaz de usuario (componentes funcionales con hooks) |
| **Vite 8**       | Build tool (dev server, bundling, HMR) |
| **Tailwind CSS** | Estilos (vía CDN, configurado en `index.html`) |
| **Leaflet**      | Mapas interactivos (selección de ubicación) |
| **SVG nativo**   | Todos los gráficos (área, barras, donut, sparkline) |

> Los gráficos son **SVG puro** (sin librerías externas), lo que los hace ligeros y personalizables.

### Enrutamiento
La app usa una máquina de estados simple con `useState` (sin react-router):

| Estado     | Descripción                        |
|------------|------------------------------------|
| `login`    | Pantalla de inicio de sesión       |
| `register` | Pantalla de registro de cuenta     |
| `panel`    | Dashboard con sidebar y módulos    |

Los módulos visibles se determinan según `roleModules` en `adminData.js`:

```javascript
// src/data/adminData.js
export const roleModules = {
  admin:     ['dashboard', 'orders', 'fleet', 'operator', 'adminManagement'],
  cliente:   ['shopping'],
  farmacia:  ['pharmacyDashboard', 'inventory', 'ordersReceived', 'pharmacyHistory', 'pharmacyPayment'],
  operador:  ['operator', 'operatorHistory', 'fleet'],
}
```

El layout base (`DashboardLayout`) mapea cada clave de módulo a su componente mediante `moduleMap`.

### Datos
**No hay backend real.** Todos los datos (usuarios, pedidos, inventario, flota) están simulados en:

```
src/data/adminData.js   ← Único archivo de datos (modificar aquí para cambiar contenido)
```

Persistencia adicional vía `localStorage`:
- `dronSalud_orders` — pedidos (usado por farmacia para polling)
- `dronSalud_fleet` — flota de drones (CRUD)
- `dronSalud_credentials` — contraseñas de nuevos usuarios
- `dronSalud_disabled` — usuarios deshabilitados
- `pharmacy_logo_*` / `pharmacy_fotoFachada_*` — imágenes subidas (base64)

---

## 📁 Estructura del proyecto

```
src/
├── assets/                          # Imágenes (logo, hero)
├── components/
│   ├── charts/                      # Gráficos SVG personalizados
│   │   ├── AreaChart.jsx            #   Gráfico de área con curva bezier + glow
│   │   ├── BarChart.jsx             #   Gráfico de barras con gradientes
│   │   ├── DonutChart.jsx           #   Gráfico de anillo (estado de pedidos)
│   │   └── Sparkline.jsx            #   Minigráfico de tendencia
│   ├── maps/
│   │   └── LocationPicker.jsx       # Selector de ubicación con Leaflet
│   ├── pharmacy/
│   │   └── PharmacyProfileCard.jsx  # Perfil de farmacia
│   └── ui/                          # Componentes reutilizables
│       ├── Badge.jsx                #   Badge de estado
│       ├── DroneDelivery.jsx        #   Animación de dron (login)
│       ├── SidebarItem.jsx          #   Item de navegación lateral
│       ├── SupportButton.jsx        #   Botón flotante de WhatsApp
│       └── UserProfileCard.jsx      #   Modal de edición de perfil
├── data/
│   └── adminData.js                 # Datos simulados + configuración de módulos
├── layouts/
│   └── DashboardLayout.jsx          # Layout: sidebar, header, reloj, notificaciones
├── pages/
│   ├── admin/
│   │   ├── DashboardPage.jsx        # Dashboard ejecutivo con KPIs y gráficos
│   │   ├── FleetPage.jsx            # CRUD de flota de drones
│   │   ├── OrdersPage.jsx           # Tabla global de pedidos
│   │   └── UserManagementPage.jsx   # Registro de usuarios con mapa
│   ├── auth/
│   │   ├── LoginPage.jsx            # Inicio de sesión
│   │   └── RegisterPage.jsx         # Registro de cuenta
│   ├── client/
│   │   ├── NewOrderPage.jsx         # Compra: farmacia → catálogo → carrito → mapa
│   │   ├── PurchaseHistoryPage.jsx  # Historial de compras
│   │   └── ShoppingPage.jsx         # Portal completo del cliente
│   ├── operator/
│   │   ├── DispatchPage.jsx         # Aceptar pedido, elegir dron, lanzar
│   │   └── HistoryPage.jsx          # Historial de entregas
│   └── pharmacy/
│       ├── DashboardPage.jsx        # Dashboard de farmacia
│       ├── InventoryPage.jsx        # CRUD de inventario con modal
│       ├── OrderHistoryPage.jsx     # Historial de pedidos
│       ├── OrdersReceivedPage.jsx   # Órdenes entrantes con flujo de estados
│       └── PaymentConfigPage.jsx    # Configuración de pago móvil + galería
├── App.jsx                          # Raíz con máquina de estados (login/register/panel)
├── index.css                        # Estilos globales, scrollbar, animaciones, glass
└── main.jsx                         # Punto de entrada (mount)
```

---

## 🎨 Personalización

### Agregar un nuevo módulo
1. Crear el componente en `src/pages/<rol>/`
2. Importarlo en `DashboardLayout.jsx` y agregarlo a `moduleMap`
3. Agregar la clave al array de `roleModules` en `adminData.js`
4. Opcional: agregar título en `moduleTitles` y entrada en `modules`

### Modificar datos simulados
Editar `src/data/adminData.js`:
- `ordersData` — pedidos, estados, montos
- `fleetData` — drones, modelos, estados
- `pharmacyProfiles` — farmacias, ubicaciones, logos
- `monthlyData` / `weeklyRevenue` — datos para gráficos
- `ordenesPorEstado` — distribución de estados en donut

### Estilos
- Tailwind config: `index.html` (bloque `<script>` con `tailwind.config`)
- Animaciones personalizadas: `src/index.css` (`.glass`, `.card-hover`, `.animate-float`, etc.)
- La tipografía usa **Inter** (cuerpo) y **Plus Jakarta Sans** (títulos) desde Google Fonts

---

## ❓ Solución de problemas

| Problema                       | Causa probable | Solución |
|--------------------------------|----------------|----------|
| Pantalla en blanco             | Error runtime en componente | Abrir consola del navegador (F12) para ver el error. Verificar imports en `DashboardLayout.jsx` |
| Los datos no se actualizan     | Datos estáticos en `adminData.js` | Modificar el archivo directamente o hacer cambios en `localStorage` |
| No aparecen módulos            | Rol no configurado en `roleModules` | Agregar el rol en `adminData.js` |
| El mapa no carga               | API Key de Leaflet o conexión | Verificar conexión a internet (Leaflet usa tiles de OpenStreetMap) |
| Los gráficos no se ven         | SVG overflow oculto | Revisar que el contenedor tenga `h-[260px]` o similar |

---

## 📦 Build de producción

```bash
npm run build
```

El output se genera en `dist/`. Para previsualizarlo:

```bash
npm run preview
```

> ⚠️ Al ser una app 100% frontend, el build de producción se puede servir desde cualquier servidor estático (nginx, Vercel, Netlify, GitHub Pages).
